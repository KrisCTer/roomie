package com.roomie.services.admin_service.service;

import com.roomie.services.admin_service.dto.response.property.PropertyResponse;
import com.roomie.services.admin_service.repository.httpclient.PropertyClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyAdminService {
    PropertyClient propertyClient;

    public List<PropertyResponse> getPendingProperties() {
        return propertyClient.getPendingProperties().getResult();
    }

    public void approveProperty(String id) {
        propertyClient.approveProperty(id);
    }

    public void rejectProperty(String id) {
        propertyClient.rejectProperty(id);
    }

    public PropertyResponse getProperty(String id) {
        return propertyClient.getProperty(id).getResult();
    }

    public void updateProperty(String id, PropertyResponse dto) {
        propertyClient.updateProperty(id, dto);
    }
}