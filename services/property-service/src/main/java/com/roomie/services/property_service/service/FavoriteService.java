package com.roomie.services.property_service.service;

import com.roomie.services.property_service.dto.response.PropertyResponse;
import com.roomie.services.property_service.entity.Favorite;
import com.roomie.services.property_service.entity.Property;
import com.roomie.services.property_service.exception.AppException;
import com.roomie.services.property_service.exception.ErrorCode;
import com.roomie.services.property_service.mapper.PropertyMapper;
import com.roomie.services.property_service.repository.FavoriteRepository;
import com.roomie.services.property_service.repository.PropertyRepository;
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
public class FavoriteService {

    FavoriteRepository favoriteRepository;
    PropertyRepository propertyRepository;
    PropertyMapper propertyMapper;

    /**
     * Toggle favorite status (add if not exist, remove if exist)
     */
    @Transactional
    public boolean toggleFavorite(String propertyId) {
        String userId = getCurrentUserId();

        // Check if property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));

        // Check if already favorited
        boolean exists = favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId);

        if (exists) {
            // Remove from favorites
            favoriteRepository.deleteByUserIdAndPropertyId(userId, propertyId);
            log.info("User {} removed property {} from favorites", userId, propertyId);
            return false;
        } else {
            // Add to favorites
            Favorite favorite = Favorite.builder()
                    .userId(userId)
                    .propertyId(propertyId)
                    .createdAt(Instant.now())
                    .build();

            favoriteRepository.save(favorite);
            log.info("User {} added property {} to favorites", userId, propertyId);
            return true;
        }
    }

    /**
     * Check if property is favorited by current user
     */
    public boolean isFavorited(String propertyId) {
        String userId = getCurrentUserId();
        return favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId);
    }

    /**
     * Get all favorite properties of current user
     */
    public List<PropertyResponse> getMyFavorites() {
        String userId = getCurrentUserId();

        List<Favorite> favorites = favoriteRepository.findByUserId(userId);

        return favorites.stream()
                .map(fav -> propertyRepository.findById(fav.getPropertyId()))
                .filter(opt -> opt.isPresent())
                .map(opt -> propertyMapper.toResponse(opt.get()))
                .collect(Collectors.toList());
    }

    /**
     * Get favorite count for a property
     */
    public long getFavoriteCount(String propertyId) {
        return favoriteRepository.countByPropertyId(propertyId);
    }

    /**
     * Remove favorite by ID
     */
    @Transactional
    public void removeFavorite(String propertyId) {
        String userId = getCurrentUserId();
        favoriteRepository.deleteByUserIdAndPropertyId(userId, propertyId);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}