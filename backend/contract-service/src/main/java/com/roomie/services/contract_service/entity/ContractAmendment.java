package com.roomie.services.contract_service.entity;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractAmendment {
    String amendmentId;
    String title;
    String content;
    String amendmentType; // PRE_SIGN_UPDATE | POST_SIGN_ADDENDUM
    String createdBy;
    String createdByRole;
    boolean contractWasSigned;
    String approvalStatus; // PENDING_CONFIRMATION | APPROVED
    boolean tenantApproved;
    boolean landlordApproved;
    Instant approvedAt;
    Instant createdAt;
}
