package com.roomie.services.payment_service.repository.httpclient;

import com.roomie.services.payment_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.payment_service.configuration.FeignMultipartConfig;
import com.roomie.services.payment_service.dto.response.ApiResponse;
import com.roomie.services.payment_service.dto.response.BillResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "billing-service",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class})
public interface BillClient {
    @PostMapping("/{billId}/pay")
    ApiResponse<BillResponse> payBill(
            @PathVariable("billId") String billId,
            @RequestParam("paymentId") String paymentId
    );
}
