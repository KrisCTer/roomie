package com.roomie.services.billing_service.repository;

import com.roomie.services.billing_service.entity.Bill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends MongoRepository<Bill, String> {
    List<Bill> findByContractId(String contractId);
    Optional<Bill> findFirstByContractIdOrderByCreatedAtDesc(String contractId);
    Optional<Bill> findByContractIdAndBillingMonth(String contractId, LocalDate billingMonth);
}
