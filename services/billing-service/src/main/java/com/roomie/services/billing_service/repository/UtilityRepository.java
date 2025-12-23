package com.roomie.services.billing_service.repository;

import com.roomie.services.billing_service.entity.Utility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilityRepository extends MongoRepository<Utility, String> {

    // Find by property
    Optional<Utility> findByPropertyIdAndActiveTrue(String propertyId);
    List<Utility> findByPropertyId(String propertyId);

    // Find by contract (for contract-specific configs)
    Optional<Utility> findByContractIdAndActiveTrue(String contractId);
    List<Utility> findByContractId(String contractId);

    // Find by landlord
    List<Utility> findByLandlordId(String landlordId);

    // Check if utility config exists
    boolean existsByPropertyIdAndActiveTrue(String propertyId);
    boolean existsByContractIdAndActiveTrue(String contractId);
}