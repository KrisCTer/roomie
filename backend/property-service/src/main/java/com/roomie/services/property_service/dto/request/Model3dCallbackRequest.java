package com.roomie.services.property_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Callback request from the 3D reconstruction pipeline (COLMAP worker via n8n).
 * Sent to POST /internal/3d-callback after processing completes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Model3dCallbackRequest {
    /** ID of the property being reconstructed */
    String propertyId;
    /** URL to the generated GLB/GLTF model file in storage */
    String model3dUrl;
    /** Pipeline result status: COMPLETED or FAILED */
    String status;
    /** Error details if status is FAILED, null otherwise */
    String errorMessage;
}
