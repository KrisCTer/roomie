package com.roomie.services.admin_service.controller;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.billing.BillResponse;
import com.roomie.services.admin_service.repository.httpclient.BillingClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BillingAdminController {
    BillingClient billingClient;

    @GetMapping
    public ApiResponse<List<BillResponse>> getAllBills() {
        var result = billingClient.getAllBills();
        return ApiResponse.success(result.getResult(), "Fetched all bills");
    }
}
