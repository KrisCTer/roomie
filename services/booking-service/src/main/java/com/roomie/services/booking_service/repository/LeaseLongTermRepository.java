package com.roomie.services.booking_service.repository;

import com.roomie.services.booking_service.entity.LeaseLongTerm;
import com.roomie.services.booking_service.enums.LeaseStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaseLongTermRepository extends MongoRepository<LeaseLongTerm, String> {
    List<LeaseLongTerm> findByPropertyIdAndStatusIn(String propertyId, List<LeaseStatus> statuses);

    @Query("{ 'propertyId': ?0, $or: [ { $and: [ { 'leaseStart': { $lte: ?2 } }, { 'leaseEnd': { $gte: ?1 } } ] } ] }")
    List<LeaseLongTerm> findOverlapping(String propertyId, Instant start, Instant end);

    List<LeaseLongTerm> findByStatusAndLeaseEndBefore(LeaseStatus leaseStatus, Instant now);
    List<LeaseLongTerm> findByTenantId(String tenantId);
    List<LeaseLongTerm> findByPropertyId(String propertyId);
    List<LeaseLongTerm> findByPropertyIdIn(List<String> propertyIds);
}

