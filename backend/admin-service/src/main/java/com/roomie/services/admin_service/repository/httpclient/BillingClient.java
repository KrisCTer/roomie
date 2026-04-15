package com.roomie.services.admin_service.repository.httpclient;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.billing.BillResponse;
import com.roomie.services.admin_service.configuration.FeignConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "billing-service",
        configuration = { FeignConfiguration.class })
public interface BillingClient {
    @GetMapping(value = "/internal/all-bills", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<BillResponse>> getAllBills();
}
