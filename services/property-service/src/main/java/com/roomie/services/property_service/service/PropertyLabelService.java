package com.roomie.services.property_service.service;

import com.roomie.services.property_service.entity.Property;
import com.roomie.services.property_service.enums.PropertyLabel;
import com.roomie.services.property_service.repository.FavoriteRepository;
import com.roomie.services.property_service.repository.PropertyRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Service to automatically assign PropertyLabel based on intelligent algorithm
 *
 * Algorithm:
 * 1. NEW: Properties created within last 7 days
 * 2. HOT: Properties with high favorite count (>= 10 favorites)
 * 3. RECOMMENDED: Properties with good engagement (5-9 favorites) and recent (< 30 days)
 * 4. NONE: All other properties
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyLabelService {

    PropertyRepository propertyRepository;
    FavoriteRepository favoriteRepository;

    // Thresholds
    private static final int NEW_PROPERTY_DAYS = 7;           // 7 days
    private static final int RECOMMENDED_DAYS = 30;            // 30 days
    private static final int HOT_FAVORITE_THRESHOLD = 10;      // >= 10 favorites
    private static final int RECOMMENDED_FAVORITE_MIN = 5;     // >= 5 favorites
    private static final int RECOMMENDED_FAVORITE_MAX = 9;     // <= 9 favorites

    /**
     * Calculate and assign label for a specific property
     */
    public PropertyLabel calculateLabel(Property property) {

        Instant now = Instant.now();
        long daysSinceCreation = ChronoUnit.DAYS.between(property.getCreatedAt(), now);
        long favoriteCount = favoriteRepository.countByPropertyId(property.getPropertyId());

        // Priority 1: HOT (High engagement regardless of age)
        if (favoriteCount >= HOT_FAVORITE_THRESHOLD) {
            log.debug("Property {} labeled as HOT ({} favorites)",
                    property.getPropertyId(), favoriteCount);
            return PropertyLabel.HOT;
        }

        // Priority 2: NEW (Recent properties)
        if (daysSinceCreation <= NEW_PROPERTY_DAYS) {
            log.debug("Property {} labeled as NEW ({} days old)",
                    property.getPropertyId(), daysSinceCreation);
            return PropertyLabel.NEW;
        }

        // Priority 3: RECOMMENDED (Good engagement + moderately recent)
        if (daysSinceCreation <= RECOMMENDED_DAYS
                && favoriteCount >= RECOMMENDED_FAVORITE_MIN
                && favoriteCount <= RECOMMENDED_FAVORITE_MAX) {
            log.debug("Property {} labeled as RECOMMENDED ({} favorites, {} days old)",
                    property.getPropertyId(), favoriteCount, daysSinceCreation);
            return PropertyLabel.RECOMMENDED;
        }

        // Default: NONE
        return PropertyLabel.NONE;
    }

    /**
     * Update label for a specific property
     */
    public void updatePropertyLabel(String propertyId) {
        propertyRepository.findById(propertyId).ifPresent(property -> {
            PropertyLabel newLabel = calculateLabel(property);

            if (property.getPropertyLabel() != newLabel) {
                property.setPropertyLabel(newLabel);
                property.setUpdatedAt(Instant.now());
                propertyRepository.save(property);

                log.info("Property {} label updated: {} -> {}",
                        propertyId, property.getPropertyLabel(), newLabel);
            }
        });
    }

    /**
     * Batch update all property labels
     * Scheduled to run daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void updateAllPropertyLabels() {
        log.info("Starting scheduled property label update...");

        List<Property> properties = propertyRepository.findAll();
        int updatedCount = 0;

        for (Property property : properties) {
            PropertyLabel oldLabel = property.getPropertyLabel();
            PropertyLabel newLabel = calculateLabel(property);

            if (oldLabel != newLabel) {
                property.setPropertyLabel(newLabel);
                property.setUpdatedAt(Instant.now());
                propertyRepository.save(property);
                updatedCount++;
            }
        }

        log.info("Property label update completed. {} properties updated out of {}",
                updatedCount, properties.size());
    }

    /**
     * Manual trigger for updating all labels (for admin)
     */
    public void manualUpdateAllLabels() {
        log.info("Manual property label update triggered");
        updateAllPropertyLabels();
    }

    /**
     * Get label statistics
     */
    public PropertyLabelStats getLabelStatistics() {
        List<Property> properties = propertyRepository.findAll();

        long hotCount = properties.stream()
                .filter(p -> p.getPropertyLabel() == PropertyLabel.HOT)
                .count();

        long newCount = properties.stream()
                .filter(p -> p.getPropertyLabel() == PropertyLabel.NEW)
                .count();

        long recommendedCount = properties.stream()
                .filter(p -> p.getPropertyLabel() == PropertyLabel.RECOMMENDED)
                .count();

        long noneCount = properties.stream()
                .filter(p -> p.getPropertyLabel() == PropertyLabel.NONE)
                .count();

        return PropertyLabelStats.builder()
                .total(properties.size())
                .hot(hotCount)
                .newLabel(newCount)
                .recommended(recommendedCount)
                .none(noneCount)
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class PropertyLabelStats {
        long total;
        long hot;
        long newLabel;
        long recommended;
        long none;
    }
}