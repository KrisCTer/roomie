package com.roomie.services.property_service.service;

import com.roomie.services.property_service.dto.response.DirectionsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DirectionsService {

    @Value("${property.google-maps-api-key}")
    private String googleMapsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String DIRECTIONS_API_URL = "https://maps.googleapis.com/maps/api/directions/json";

    @SuppressWarnings("unchecked")
    public DirectionsResponse getDirections(double originLat, double originLng,
                                            double destLat, double destLng) {
        String origin = originLat + "," + originLng;
        String destination = destLat + "," + destLng;

        String url = UriComponentsBuilder.fromHttpUrl(DIRECTIONS_API_URL)
                .queryParam("origin", origin)
                .queryParam("destination", destination)
                .queryParam("mode", "driving")
                .queryParam("language", "vi")
                .queryParam("key", googleMapsApiKey)
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !"OK".equals(response.get("status"))) {
            log.warn("Google Directions API returned status: {}",
                    response != null ? response.get("status") : "null");
            return DirectionsResponse.builder()
                    .distanceText("N/A")
                    .distanceMeters(0)
                    .durationText("N/A")
                    .durationSeconds(0)
                    .polylinePoints(List.of())
                    .build();
        }

        List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");
        if (routes == null || routes.isEmpty()) {
            return DirectionsResponse.builder()
                    .distanceText("N/A")
                    .distanceMeters(0)
                    .durationText("N/A")
                    .durationSeconds(0)
                    .polylinePoints(List.of())
                    .build();
        }

        Map<String, Object> route = routes.get(0);
        List<Map<String, Object>> legs = (List<Map<String, Object>>) route.get("legs");
        Map<String, Object> leg = legs.get(0);

        Map<String, Object> distance = (Map<String, Object>) leg.get("distance");
        Map<String, Object> duration = (Map<String, Object>) leg.get("duration");

        String overviewPolyline = (String) ((Map<String, Object>) route.get("overview_polyline")).get("points");
        List<double[]> decodedPoints = decodePolyline(overviewPolyline);

        return DirectionsResponse.builder()
                .distanceText((String) distance.get("text"))
                .distanceMeters(((Number) distance.get("value")).longValue())
                .durationText((String) duration.get("text"))
                .durationSeconds(((Number) duration.get("value")).longValue())
                .polylinePoints(decodedPoints)
                .startAddress((String) leg.get("start_address"))
                .endAddress((String) leg.get("end_address"))
                .build();
    }

    private List<double[]> decodePolyline(String encoded) {
        List<double[]> points = new ArrayList<>();
        int index = 0;
        int lat = 0;
        int lng = 0;

        while (index < encoded.length()) {
            int shift = 0;
            int result = 0;
            int b;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1F) << shift;
                shift += 5;
            } while (b >= 0x20);
            lat += (result & 1) != 0 ? ~(result >> 1) : (result >> 1);

            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1F) << shift;
                shift += 5;
            } while (b >= 0x20);
            lng += (result & 1) != 0 ? ~(result >> 1) : (result >> 1);

            points.add(new double[]{lat / 1e5, lng / 1e5});
        }
        return points;
    }
}
