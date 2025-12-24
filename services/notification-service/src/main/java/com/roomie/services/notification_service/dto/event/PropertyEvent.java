package com.roomie.services.notification_service.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PropertyEvent {
    String propertyId;
    String title;
    String ownerId;
    String ownerName;
    String status;
    String rejectionReason;
}