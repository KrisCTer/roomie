package com.roomie.services.billing_service.repository;

import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.enums.BillStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends MongoRepository<Bill, String> {

    // Find by contract
    List<Bill> findByContractId(String contractId);
    Optional<Bill> findByContractIdAndBillingMonth(String contractId, LocalDate billingMonth);
    Optional<Bill> findFirstByContractIdOrderByCreatedAtDesc(String contractId);

    // Find by landlord/tenant
    List<Bill> findByLandlordId(String landlordId);
    List<Bill> findByTenantId(String tenantId);

    // Find by status
    List<Bill> findByStatus(BillStatus status);
    List<Bill> findByStatusAndDueDateBefore(BillStatus status, LocalDate date);

    // Find by property
    List<Bill> findByPropertyId(String propertyId);

    // Bulk operations
    List<Bill> findByContractIdIn(List<String> contractIds);
}