package com.roomie.services.booking_service.service;

import com.roomie.services.booking_service.dto.event.BookingCreatedEvent;
import com.roomie.services.booking_service.dto.event.BookingEvent;
import com.roomie.services.booking_service.dto.event.NotificationEvent;
import com.roomie.services.booking_service.dto.request.BookingRequest;
import com.roomie.services.booking_service.dto.response.BookingResponse;
import com.roomie.services.booking_service.dto.response.property.PropertyResponse;
import com.roomie.services.booking_service.entity.LeaseLongTerm;
import com.roomie.services.booking_service.enums.ApprovalStatus;
import com.roomie.services.booking_service.enums.LeaseStatus;
import com.roomie.services.booking_service.enums.PropertyStatus;
import com.roomie.services.booking_service.exception.AppException;
import com.roomie.services.booking_service.exception.ErrorCode;
import com.roomie.services.booking_service.mapper.BookingMapper;
import com.roomie.services.booking_service.repository.LeaseLongTermRepository;
import com.roomie.services.booking_service.repository.httpclient.ProfileClient;
import com.roomie.services.booking_service.repository.httpclient.PropertyClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingService {
    LeaseLongTermRepository ltRepo;
    BookingMapper bookingMapper;
    RedisLockService lockService;
    RedisCacheService cacheService;
    PropertyClient propertyClient;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;

    long LOCK_TTL_SECONDS = 15 * 60;
    long CACHE_TTL_SECONDS = 5 * 60;

    public BookingResponse create(BookingRequest req) {
        String tenantId = SecurityContextHolder.getContext().getAuthentication().getName();

        PropertyResponse property = propertyClient.getById(req.getPropertyId()).getResult();
        if (property == null) throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);

        String lockKey = "lock:property:" + req.getPropertyId();
        String token = lockService.tryLock(lockKey, LOCK_TTL_SECONDS);
        if (token == null) throw new AppException(ErrorCode.PROPERTY_LOCKED);

        try {
            boolean available = isLongTermAvailable(req.getPropertyId(), req.getLeaseStart(), req.getLeaseEnd());
            if (!available) throw new AppException(ErrorCode.LONG_TERM_NOT_AVAILABLE);

            LeaseLongTerm lease = bookingMapper.toLeaseEntity(req);
            lease.setLandLordId(property.getOwner().getOwnerId());
            lease.setTenantId(tenantId);
            lease.setMonthlyRent(property.getMonthlyRent());
            lease.setRentalDeposit(property.getRentalDeposit());
            lease.setLeaseStart(req.getLeaseStart());
            lease.setLeaseEnd(req.getLeaseEnd());
            lease.setStatus(LeaseStatus.PENDING_APPROVAL);
            lease.setCreatedAt(Instant.now());
            lease.setUpdatedAt(Instant.now());

            LeaseLongTerm saved = ltRepo.save(lease);
            cacheService.put(cacheKey(saved.getId()), saved, CACHE_TTL_SECONDS);

            BookingEvent event = buildBookingEvent(saved, property);
            kafkaTemplate.send("booking.created", event);
            log.info("Published booking.created event for bookingId={}", saved.getId());

            return bookingMapper.leaseToResponse(lease);
        } finally {
            lockService.releaseLock(lockKey, token);
        }
    }

    public Optional<BookingResponse> getById(String id) {
        Optional<LeaseLongTerm> cached = cacheService.get(cacheKey(id), LeaseLongTerm.class);
        if (cached.isPresent()) return Optional.of(bookingMapper.leaseToResponse(cached.get()));
        return ltRepo.findById(id).map(e -> {
            cacheService.put(cacheKey(id), e, CACHE_TTL_SECONDS);
            return bookingMapper.leaseToResponse(e);
        });
    }

    public List<BookingResponse> getBookingsByTenant(String tenantId) {
        List<LeaseLongTerm> leases = ltRepo.findByTenantId(tenantId);
        return leases.stream()
                .map(bookingMapper::leaseToResponse)
                .toList();
    }

    public List<BookingResponse> getBookingsByOwner(String ownerId) {
        // Get all properties owned by this user
        List<String> propertyIds = getOwnerPropertyIds(ownerId);

        // Get all bookings for these properties
        List<LeaseLongTerm> leases = ltRepo.findByPropertyIdIn(propertyIds);
        return leases.stream()
                .map(bookingMapper::leaseToResponse)
                .toList();
    }

    public List<BookingResponse> getBookingsByProperty(String propertyId) {
        List<LeaseLongTerm> leases = ltRepo.findByPropertyId(propertyId);
        return leases.stream()
                .map(bookingMapper::leaseToResponse)
                .toList();
    }

    private List<String> getOwnerPropertyIds(String ownerId) {
        // Call property service to get owner's properties
        // This is a simplified version - you might need to handle pagination
        try {
            var response = propertyClient.getPropertiesByOwner(ownerId);
            if (response != null && response.getResult() != null) {
                return response.getResult()
                        .stream()
                        .map(PropertyResponse::getPropertyId)
                        .toList();

            }
        } catch (Exception e) {
            log.error("Error fetching owner properties", e);
        }
        return List.of();
    }

    public BookingResponse confirm(String id) {
        LeaseLongTerm lease = ltRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        if (lease.getStatus() != LeaseStatus.PENDING_APPROVAL)
            throw new AppException(ErrorCode.LONG_TERM_INVALID_STATUS);
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        PropertyResponse property = propertyClient.getById(lease.getPropertyId()).getResult();
        if (!property.getOwner().getOwnerId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        lease.setStatus(LeaseStatus.ACTIVE);
        lease.setUpdatedAt(Instant.now());
        LeaseLongTerm saved = ltRepo.save(lease);
        cacheService.put(cacheKey(id), saved, CACHE_TTL_SECONDS);
        BookingEvent event = buildBookingEvent(saved, property);
        kafkaTemplate.send("booking.confirmed", event);
        log.info("Published booking.confirmed event for bookingId={}", saved.getId());
        return bookingMapper.leaseToResponse(lease);
    }

    public BookingResponse reject(String id, String reason) {
        LeaseLongTerm lease = ltRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (lease.getStatus() != LeaseStatus.PENDING_APPROVAL)
            throw new AppException(ErrorCode.LONG_TERM_INVALID_STATUS);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        PropertyResponse property = propertyClient.getById(lease.getPropertyId()).getResult();

        if (!property.getOwner().getOwnerId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        lease.setStatus(LeaseStatus.REJECTED);
        lease.setUpdatedAt(Instant.now());
        LeaseLongTerm saved = ltRepo.save(lease);
        cacheService.evict(cacheKey(id));

        BookingEvent event = buildBookingEvent(saved, property);
        kafkaTemplate.send("booking.rejected", event);
        log.info("Published booking.rejected event for bookingId={}", saved.getId());

        return bookingMapper.leaseToResponse(saved);
    }

    public BookingResponse cancel(String id) {
        LeaseLongTerm lease = ltRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        PropertyResponse property = propertyClient.getById(lease.getPropertyId()).getResult();

        String cancelledBy = currentUserId.equals(lease.getTenantId()) ? "TENANT" : "LANDLORD";

        lease.setStatus(LeaseStatus.TERMINATED);
        lease.setUpdatedAt(Instant.now());
        LeaseLongTerm saved = ltRepo.save(lease);
        cacheService.evict(cacheKey(id));

        BookingEvent event = buildBookingEvent(saved, property);
        event.setStatus(lease.getStatus().name() + "_BY_" + cancelledBy);
        kafkaTemplate.send("booking.cancelled", event);
        log.info("Published booking.cancelled event for bookingId={}", saved.getId());

        return bookingMapper.leaseToResponse(saved);
    }

    public BookingResponse pause(String id, String reason) {
        LeaseLongTerm lease = ltRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        lease.setStatus(LeaseStatus.PAUSED);
        lease.setUpdatedAt(Instant.now());
        ltRepo.save(lease);
        return bookingMapper.leaseToResponse(ltRepo.save(lease));
    }

    public BookingResponse resume(String id) {
        LeaseLongTerm lease = ltRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        lease.setStatus(LeaseStatus.ACTIVE);
        lease.setUpdatedAt(Instant.now());
        ltRepo.save(lease);
        return bookingMapper.leaseToResponse(ltRepo.save(lease));
    }

    public BookingResponse terminate(String id, String reason) {
        LeaseLongTerm lease = ltRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        lease.setStatus(LeaseStatus.TERMINATED);
        lease.setUpdatedAt(Instant.now());
        LeaseLongTerm saved = ltRepo.save(lease);

        PropertyResponse property = propertyClient.getById(lease.getPropertyId()).getResult();
        propertyClient.markAsAvailable(lease.getPropertyId());

        BookingEvent event = buildBookingEvent(saved, property);
        kafkaTemplate.send("booking.terminated", event);
        log.info("Published booking.terminated event for bookingId={}", saved.getId());

        return bookingMapper.leaseToResponse(saved);
    }

    private void validatePropertyRentable(PropertyResponse property) {
        if (property == null) {
            throw new AppException(ErrorCode.PROPERTY_NOT_FOUND);
        }

        if (property.getStatus() != ApprovalStatus.ACTIVE) {
            throw new AppException(ErrorCode.PROPERTY_NOT_APPROVED);
        }

        if (property.getPropertyStatus() != PropertyStatus.AVAILABLE) {
            throw new AppException(ErrorCode.PROPERTY_NOT_AVAILABLE);
        }
    }


    @Scheduled(cron = "0 0 1 * * *") // Daily at 1 AM
    public void expireLeases() {
        Instant now = Instant.now();
        List<LeaseLongTerm> expiring = ltRepo.findByStatusAndLeaseEndBefore(
                LeaseStatus.ACTIVE,
                now
        );

        for (LeaseLongTerm lease : expiring) {
            lease.setStatus(LeaseStatus.EXPIRED);
            lease.setUpdatedAt(now);
            LeaseLongTerm saved = ltRepo.save(lease);

            try {
                PropertyResponse property = propertyClient.getById(lease.getPropertyId()).getResult();
                propertyClient.markAsAvailable(lease.getPropertyId());

                BookingEvent event = buildBookingEvent(saved, property);
                kafkaTemplate.send("booking.expired", event);
                log.info("Published booking.expired event for bookingId={}", saved.getId());
            } catch (Exception e) {
                log.error("Failed to process expired lease: {}", lease.getId(), e);
            }
        }
    }

    public BookingResponse renew(String id, BookingRequest renewalRequest) {
        LeaseLongTerm oldLease = ltRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Mark old lease as RENEWED
        oldLease.setStatus(LeaseStatus.RENEWED);
        oldLease.setUpdatedAt(Instant.now());
        ltRepo.save(oldLease);
        BookingResponse newLease = create(renewalRequest);
        ltRepo.save(oldLease);
        return newLease;
    }

    private String cacheKey(String id) {
        return "cache:lease:lt:" + id;
    }

    private boolean isLongTermAvailable(String propertyId, Instant start, Instant end) {
        var overlapping = ltRepo.findOverlapping(propertyId, start, end);
        return overlapping.stream().noneMatch(l -> {
            switch (l.getStatus()) {
                case TERMINATED, EXPIRED -> {
                    return false;
                }
                default -> {
                    return true;
                }
            }
        });
    }
    private BookingEvent buildBookingEvent(LeaseLongTerm lease, PropertyResponse property) {
        String tenantName = "Unknown Tenant";
        String landlordName = "Unknown Landlord";

        try {
            var tenantProfile = profileClient.getProfile(lease.getTenantId());
            if (tenantProfile != null && tenantProfile.getResult() != null) {
                tenantName = tenantProfile.getResult().getFirstName();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch tenant profile for event", e);
        }

        try {
            var landlordProfile = profileClient.getProfile(lease.getLandLordId());
            if (landlordProfile != null && landlordProfile.getResult() != null) {
                landlordName = landlordProfile.getResult().getFirstName();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch landlord profile for event", e);
        }

        return BookingEvent.builder()
                .bookingId(lease.getId())
                .propertyId(lease.getPropertyId())
                .propertyTitle(property != null ? property.getTitle() : "Unknown Property")
                .tenantId(lease.getTenantId())
                .tenantName(tenantName)
                .landlordId(lease.getLandLordId())
                .landlordName(landlordName)
                .checkInDate(lease.getLeaseStart())
                .checkOutDate(lease.getLeaseEnd())
                .totalPrice(lease.getMonthlyRent())
                .monthlyRent(lease.getMonthlyRent())
                .rentalDeposit(lease.getRentalDeposit())
                .status(lease.getStatus().name())
                .build();
    }
}