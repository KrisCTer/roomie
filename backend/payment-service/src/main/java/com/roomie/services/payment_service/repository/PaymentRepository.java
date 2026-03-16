package com.roomie.services.payment_service.repository;

import com.roomie.services.payment_service.entity.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserId(String userId);
    List<Payment> findByContractId(String contractId);
    List<Payment> findByBookingId(String bookingId);
    List<Payment> findByBillId(String billId);
}
