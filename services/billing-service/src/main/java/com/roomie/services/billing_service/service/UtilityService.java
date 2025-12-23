package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.request.UtilityRequest;
import com.roomie.services.billing_service.dto.response.UtilityResponse;
import com.roomie.services.billing_service.entity.Utility;
import com.roomie.services.billing_service.exception.AppException;
import com.roomie.services.billing_service.exception.ErrorCode;
import com.roomie.services.billing_service.mapper.UtilityMapper;
import com.roomie.services.billing_service.repository.UtilityRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UtilityService {

    UtilityRepository utilityRepository;
    UtilityMapper utilityMapper;

    // ==================== CREATE ====================

    @Transactional
    public UtilityResponse createUtility(UtilityRequest request) {
        log.info("Creating utility config for property: {}", request.getPropertyId());

        // Validate: Check if active config already exists
        if (request.getContractId() != null) {
            if (utilityRepository.existsByContractIdAndActiveTrue(request.getContractId())) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                        "Active utility config already exists for this contract");
            }
        } else {
            if (utilityRepository.existsByPropertyIdAndActiveTrue(request.getPropertyId())) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                        "Active utility config already exists for this property");
            }
        }

        String currentUserId = getCurrentUserId();

        Utility utility = utilityMapper.toEntity(request);
        utility.setLandlordId(currentUserId);
        utility.setActive(true);
        utility.setCreatedAt(Instant.now());
        utility.setUpdatedAt(Instant.now());
        utility.setCreatedBy(currentUserId);

        Utility saved = utilityRepository.save(utility);

        log.info("Utility config created successfully: {}", saved.getId());
        return utilityMapper.toResponse(saved);
    }

    // ==================== READ ====================

    public UtilityResponse getUtility(String id) {
        log.debug("Fetching utility config: {}", id);
        Utility utility = getUtilityEntity(id);
        return utilityMapper.toResponse(utility);
    }

    public UtilityResponse getUtilityByProperty(String propertyId) {
        log.debug("Fetching utility config for property: {}", propertyId);

        Utility utility = utilityRepository.findByPropertyIdAndActiveTrue(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                        "No active utility config found for property: " + propertyId));

        return utilityMapper.toResponse(utility);
    }

    public UtilityResponse getUtilityByContract(String contractId) {
        log.debug("Fetching utility config for contract: {}", contractId);

        // Try contract-specific first
        return utilityRepository.findByContractIdAndActiveTrue(contractId)
                .map(utilityMapper::toResponse)
                .orElse(null); // Contract may inherit property-level config
    }

    public List<UtilityResponse> getMyUtilities() {
        String landlordId = getCurrentUserId();
        log.debug("Fetching utilities for landlord: {}", landlordId);

        return utilityRepository.findByLandlordId(landlordId).stream()
                .map(utilityMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== UPDATE ====================

    @Transactional
    public UtilityResponse updateUtility(String id, UtilityRequest request) {
        log.info("Updating utility config: {}", id);

        Utility utility = getUtilityEntity(id);

        // Verify ownership
        String currentUserId = getCurrentUserId();
        if (!utility.getLandlordId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        utilityMapper.updateEntity(request, utility);
        utility.setUpdatedAt(Instant.now());
        utility.setUpdatedBy(currentUserId);

        Utility saved = utilityRepository.save(utility);

        log.info("Utility config updated successfully: {}", id);
        return utilityMapper.toResponse(saved);
    }

    // ==================== DEACTIVATE ====================

    @Transactional
    public void deactivateUtility(String id) {
        log.info("Deactivating utility config: {}", id);

        Utility utility = getUtilityEntity(id);

        // Verify ownership
        String currentUserId = getCurrentUserId();
        if (!utility.getLandlordId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        utility.setActive(false);
        utility.setUpdatedAt(Instant.now());
        utility.setUpdatedBy(currentUserId);

        utilityRepository.save(utility);

        log.info("Utility config deactivated successfully: {}", id);
    }

    // ==================== DELETE ====================

    @Transactional
    public void deleteUtility(String id) {
        log.info("Deleting utility config: {}", id);

        Utility utility = getUtilityEntity(id);

        // Verify ownership
        String currentUserId = getCurrentUserId();
        if (!utility.getLandlordId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        utilityRepository.deleteById(id);

        log.info("Utility config deleted successfully: {}", id);
    }

    // ==================== HELPER METHODS ====================

    private Utility getUtilityEntity(String id) {
        return utilityRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                        "Utility config not found: " + id));
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    /**
     * Get utility config for bill creation
     * Tries contract-specific first, falls back to property-level
     */
    public Utility getUtilityForBilling(String propertyId, String contractId) {
        // Try contract-specific config first
        if (contractId != null) {
            var contractUtility = utilityRepository.findByContractIdAndActiveTrue(contractId);
            if (contractUtility.isPresent()) {
                return contractUtility.get();
            }
        }

        // Fall back to property-level config
        return utilityRepository.findByPropertyIdAndActiveTrue(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                        "No utility configuration found for property: " + propertyId));
    }
}