package com.roomie.services.billing_service.repository;

import com.roomie.services.billing_service.entity.MeterReading;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingRepository extends MongoRepository<MeterReading, String> {

    // Find by contract
    List<MeterReading> findByContractIdOrderByReadingMonthDesc(String contractId);

    Optional<MeterReading> findFirstByContractIdOrderByReadingMonthDesc(String contractId);

    Optional<MeterReading> findByContractIdAndReadingMonth(String contractId, LocalDate readingMonth);

    // Find by property
    List<MeterReading> findByPropertyIdOrderByReadingMonthDesc(String propertyId);

    // Find by bill
    Optional<MeterReading> findByBillId(String billId);

    // Find by date range
    List<MeterReading> findByContractIdAndReadingMonthBetween(
            String contractId, LocalDate start, LocalDate end);
}