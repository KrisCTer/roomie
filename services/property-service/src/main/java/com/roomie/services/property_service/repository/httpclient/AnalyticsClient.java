package com.roomie.services.property_service.repository.httpclient;

import com.roomie.services.property_service.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "analytics-service", url = "${app.services.analytics}")
public interface AnalyticsClient {
//    @PostMapping("/track")
//    ApiResponse<Void> track(@RequestBody AnalyticsEventRequest event);
}
