package com.roomie.services.booking_service.service;

import com.roomie.services.booking_service.dto.event.BookingCreatedEvent;
import com.roomie.services.booking_service.dto.request.BookingRequest;
import com.roomie.services.booking_service.dto.response.BookingResponse;
import com.roomie.services.booking_service.dto.response.property.PropertyResponse;
import com.roomie.services.booking_service.entity.LeaseLongTerm;
import com.roomie.services.booking_service.enums.LeaseStatus;
import com.roomie.services.booking_service.exception.AppException;
import com.roomie.services.booking_service.exception.ErrorCode;
import com.roomie.services.booking_service.mapper.BookingMapper;
import com.roomie.services.booking_service.repository.LeaseLongTermRepository;
import com.roomie.services.booking_service.repository.httpclient.PropertyClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingService {
    LeaseLongTermRepository ltRepo;
    BookingMapper bookingMapper; // change to @Component if needed
    RedisLockService lockService;
    RedisCacheService cacheService;
    KafkaTemplate<String, BookingCreatedEvent> kafkaTemplate;
    PropertyClient propertyClient;

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
            lease.setTenantId(tenantId);
            lease.setStatus(LeaseStatus.PENDING_APPROVAL);

            ltRepo.save(lease);
            cacheService.put(cacheKey(lease.getId()), lease, CACHE_TTL_SECONDS);

            kafkaTemplate.send("lease.created", new BookingCreatedEvent(lease.getId(), lease.getTenantId(), lease.getPropertyId(), lease.getMonthlyRent()));

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

    public BookingResponse confirm(String id) {
        LeaseLongTerm lease = ltRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        if (lease.getStatus() != LeaseStatus.PENDING_APPROVAL)
            throw new AppException(ErrorCode.LONG_TERM_INVALID_STATUS);
        lease.setStatus(LeaseStatus.ACTIVE);
        lease.setUpdatedAt(Instant.now());
        ltRepo.save(lease);
        cacheService.put(cacheKey(id), lease, CACHE_TTL_SECONDS);
        kafkaTemplate.send("lease.confirmed", new BookingCreatedEvent(lease.getId(), lease.getTenantId(), lease.getPropertyId(), lease.getMonthlyRent()));
        return bookingMapper.leaseToResponse(lease);
    }

    public BookingResponse cancel(String id) {
        LeaseLongTerm lease = ltRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        lease.setStatus(LeaseStatus.TERMINATED);
        lease.setUpdatedAt(Instant.now());
        ltRepo.save(lease);
        cacheService.evict(cacheKey(id));
        kafkaTemplate.send("lease.cancelled", new BookingCreatedEvent(lease.getId(), lease.getTenantId(), lease.getPropertyId(), lease.getMonthlyRent()));
        return bookingMapper.leaseToResponse(lease);
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
}