package com.roomie.services.property_service.controller;

import com.roomie.services.property_service.dto.request.PropertyRequest;
import com.roomie.services.property_service.dto.response.ApiResponse;
import com.roomie.services.property_service.dto.response.DirectionsResponse;
import com.roomie.services.property_service.dto.response.NearbyPropertyResponse;
import com.roomie.services.property_service.dto.response.PropertyResponse;
import com.roomie.services.property_service.service.DirectionsService;
import com.roomie.services.property_service.service.PropertyService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PropertyController {
    PropertyService propertyService;
    DirectionsService directionsService;

    @PostMapping
    public ApiResponse<PropertyResponse> createProperty(@RequestBody @Valid PropertyRequest request) {
        return ApiResponse.success(propertyService.create(request), "Property created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<PropertyResponse> update(@PathVariable String id, @RequestBody @Valid PropertyRequest request) {
        return ApiResponse.success(propertyService.update(id, request), "Property updated successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<PropertyResponse> getById(@PathVariable String id) {
        return ApiResponse.success(propertyService.getById(id), "Property fetched successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        propertyService.delete(id);
        return ApiResponse.success(null, "Property deleted successfully");
    }

    @GetMapping("/properties")
    public ApiResponse<List<PropertyResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(propertyService.findAll(page, size), "Property list fetched successfully");
    }

    @GetMapping("/owner/me")
    public ApiResponse<List<PropertyResponse>> getMyProperties() {
        return ApiResponse.success(propertyService.getMyProperties(), "Get my property successfully");
    }

    @GetMapping("/owner/{ownerId}")
    public ApiResponse<List<PropertyResponse>> getPropertiesByOwner(@PathVariable String ownerId) {
        return ApiResponse.success(propertyService.getPropertiesByOwner(ownerId), "Get properties by owner successfully");
    }

    @GetMapping("/public")
    public ApiResponse<List<PropertyResponse>> getPublicProperties() {
        return ApiResponse.success(propertyService.getAllPublicProperties(), "Get all public property successfully");
    }

    @GetMapping("/search")
    public ApiResponse<List<PropertyResponse>> search(@RequestParam String q) {
        return ApiResponse.success(propertyService.searchFullText(q), "Search results fetched successfully");
    }

    @GetMapping("/nearby")
    public ApiResponse<List<NearbyPropertyResponse>> searchNearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5") Double radiusKm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.success(
                propertyService.searchNearby(lat, lng, radiusKm, page, size),
                "Nearby properties fetched successfully");
    }

    @GetMapping("/directions")
    public ApiResponse<DirectionsResponse> getDirections(
            @RequestParam Double originLat,
            @RequestParam Double originLng,
            @RequestParam Double destLat,
            @RequestParam Double destLng) {
        return ApiResponse.success(
                directionsService.getDirections(originLat, originLng, destLat, destLng),
                "Directions fetched successfully");
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<PropertyResponse> publishProperty(@PathVariable String id) {
        return ApiResponse.success(propertyService.publish(id), "Property published successfully");
    }

    @GetMapping("/by-price")
    public ApiResponse<List<PropertyResponse>> byPrice(@RequestParam BigDecimal min, @RequestParam BigDecimal max) {
        return ApiResponse.success(propertyService.findByPriceRange(min, max), "Properties fetched by price range");
    }

    @GetMapping("/by-province")
    public ApiResponse<List<PropertyResponse>> byProvince(@RequestParam String province) {
        return ApiResponse.success(propertyService.findByProvince(province), "Properties fetched by province");
    }

    @PostMapping("/{propertyId}/rented")
    public ApiResponse<Void> markAsRented(@PathVariable String propertyId) {
        propertyService.markAsRented(propertyId);
        return ApiResponse.success(null, "Property marked as RENTED");
    }

    @PostMapping("/{propertyId}/available")
    public ApiResponse<Void> markAsAvailable(@PathVariable String propertyId) {
        propertyService.markAsAvailable(propertyId);
        return ApiResponse.success(null, "Property marked as AVAILABLE");
    }

    @PostMapping("/{propertyId}/deactivate")
    public ApiResponse<Void> deactivate(@PathVariable String propertyId) {
        propertyService.deactivate(propertyId);
        return ApiResponse.success(null, "Property deactivated");
    }

    @PostMapping("/{propertyId}/3d-model")
    public ApiResponse<PropertyResponse> requestModel3d(@PathVariable String propertyId) {
        return ApiResponse.success(
                propertyService.requestModel3d(propertyId),
                "3D reconstruction requested"
        );
    }

    @PutMapping("/{propertyId}/3d-visibility")
    public ApiResponse<PropertyResponse> toggle3dVisibility(
            @PathVariable String propertyId,
            @RequestParam boolean visible) {
        return ApiResponse.success(
                propertyService.toggleModel3dVisibility(propertyId, visible),
                "3D visibility updated"
        );
    }
}