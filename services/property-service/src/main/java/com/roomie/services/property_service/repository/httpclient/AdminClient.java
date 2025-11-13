package com.roomie.services.property_service.repository.httpclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "admin-service", url = "${app.services.admin}")
public interface AdminClient {
//    @PostMapping("/review-queue")
//    void addToReviewQueue(@RequestBody PropertyReviewRequest request);
}
