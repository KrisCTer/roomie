package com.roomie.services.property_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class GeocodingService {

    @Value("${property.google-maps-api-key:}")
    private String googleMapsApiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Geocode an address string to "lat,lng" format.
     * Returns null if geocoding fails or API key is missing.
     */
    public String geocode(String address) {
        if (address == null || address.isBlank() || googleMapsApiKey == null || googleMapsApiKey.isBlank()) {
            return null;
        }

        try {
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address="
                    + encodedAddress + "&key=" + googleMapsApiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = objectMapper.readTree(response.body());
            String status = root.path("status").asText();

            if ("OK".equals(status)) {
                JsonNode location = root.path("results").get(0).path("geometry").path("location");
                double lat = location.path("lat").asDouble();
                double lng = location.path("lng").asDouble();
                String result = lat + "," + lng;
                log.info("Geocoded '{}' → {}", address, result);
                return result;
            } else {
                log.warn("Geocoding failed for '{}': status={}", address, status);
                return null;
            }
        } catch (Exception e) {
            log.error("Geocoding error for '{}': {}", address, e.getMessage());
            return null;
        }
    }
}
