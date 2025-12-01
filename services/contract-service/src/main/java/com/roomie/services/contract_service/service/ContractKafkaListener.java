package com.roomie.services.contract_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomie.services.contract_service.dto.event.PaymentCompletedEvent;
import com.roomie.services.contract_service.dto.request.ContractRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractKafkaListener {
    ObjectMapper mapper;
    ContractService contractService;

    @KafkaListener(topics = "booking.contract.requested", groupId = "contract-service")
    public void onBookingRequested(String msg) {
        try {
            ContractRequest req = mapper.readValue(msg, ContractRequest.class);
            log.info("booking.contract.requested -> create draft contract bookingId={}", req.getBookingId());
            contractService.create(req);
        } catch (Exception ex) {
            log.error("fail booking.contract.requested", ex);
        }
    }

    @KafkaListener(topics = "payment.completed", groupId = "contract-service")
    public void onPaymentCompleted(String msg) {
        try {
            PaymentCompletedEvent evt = mapper.readValue(msg, PaymentCompletedEvent.class);
            log.info("payment.completed -> activate contract bookingId={}", evt.getBookingId());
            contractService.onPaymentCompleted(evt);
        } catch (Exception ex) {
            log.error("fail payment.completed", ex);
        }
    }
}
