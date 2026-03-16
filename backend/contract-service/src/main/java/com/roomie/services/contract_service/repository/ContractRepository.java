package com.roomie.services.contract_service.repository;

import com.roomie.services.contract_service.entity.Contract;
import com.roomie.services.contract_service.enums.ContractStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends MongoRepository<Contract, String> {
    Optional<Contract> findByBookingId(String bookingId);

    List<Contract> findByStatusAndEndDateBefore(ContractStatus contractStatus, Instant now);

    List<Contract> findByLandlordId(String landlordId);

    List<Contract> findByTenantId(String userId);

}