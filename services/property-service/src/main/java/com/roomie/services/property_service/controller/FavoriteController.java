package com.roomie.services.property_service.controller;

import com.roomie.services.property_service.dto.response.ApiResponse;
import com.roomie.services.property_service.dto.response.PropertyResponse;
import com.roomie.services.property_service.service.FavoriteService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FavoriteController {

    FavoriteService favoriteService;

    /**
     * Toggle favorite status for a property
     * POST /property/favorites/{propertyId}/toggle
     */
    @PostMapping("/{propertyId}/toggle")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFavorite(
            @PathVariable String propertyId) {

        boolean isFavorited = favoriteService.toggleFavorite(propertyId);
        long favoriteCount = favoriteService.getFavoriteCount(propertyId);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "isFavorited", isFavorited,
                        "favoriteCount", favoriteCount
                ),
                isFavorited ? "Added to favorites" : "Removed from favorites"
        ));
    }

    /**
     * Check if property is favorited
     * GET /property/favorites/{propertyId}/check
     */
    @GetMapping("/{propertyId}/check")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkFavorite(
            @PathVariable String propertyId) {

        boolean isFavorited = favoriteService.isFavorited(propertyId);
        long favoriteCount = favoriteService.getFavoriteCount(propertyId);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "isFavorited", isFavorited,
                        "favoriteCount", favoriteCount
                ),
                "Favorite status retrieved"
        ));
    }

    /**
     * Get all favorite properties of current user
     * GET /property/favorites/my-favorites
     */
    @GetMapping("/my-favorites")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getMyFavorites() {
        List<PropertyResponse> favorites = favoriteService.getMyFavorites();
        return ResponseEntity.ok(ApiResponse.success(
                favorites,
                "My favorites retrieved"
        ));
    }

    /**
     * Remove favorite
     * DELETE /property/favorites/{propertyId}
     */
    @DeleteMapping("/{propertyId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable String propertyId) {

        favoriteService.removeFavorite(propertyId);
        return ResponseEntity.ok(ApiResponse.success(
                null,
                "Removed from favorites"
        ));
    }

    /**
     * Get favorite count for a property
     * GET /property/favorites/{propertyId}/count
     */
    @GetMapping("/{propertyId}/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getFavoriteCount(
            @PathVariable String propertyId) {

        long count = favoriteService.getFavoriteCount(propertyId);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("count", count),
                "Favorite count retrieved"
        ));
    }
}