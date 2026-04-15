package com.roomie.services.billing_service.controller;

import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.service.EnhancedBillingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalBillingController {
    EnhancedBillingService billingService;

    @GetMapping("/all-bills")
    public ApiResponse<List<BillResponse>> getAllBills() {
        return ApiResponse.success(billingService.getAll(), "Fetched all bills");
    }
}
