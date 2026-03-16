package com.roomie.services.contract_service.repository;

import com.roomie.services.contract_service.entity.OTPVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends MongoRepository<OTPVerification, String> {
    Optional<OTPVerification> findByContractIdAndUserIdAndPurposeAndVerifiedFalseAndExpiresAtAfter(
            String contractId,
            String userId,
            String purpose,
            Instant now
    );

    void deleteByContractIdAndUserId(String contractId, String userId);
}
