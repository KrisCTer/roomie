package com.roomie.services.property_service.repository.httpclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${app.services.notification}")
public interface NotificationClient {
//    @PostMapping("/send")
//    void sendNotification(@RequestBody NotificationRequest request);
}
