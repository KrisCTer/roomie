package com.roomie.services.admin_service.service;

import com.roomie.services.admin_service.dto.response.property.PropertyResponse;
import com.roomie.services.admin_service.repository.httpclient.PropertyClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyAdminService {
    PropertyClient propertyClient;
    RedisTemplate<String, Object> redis;

    public List<PropertyResponse> getPendingProperties() {
        String key = "property:pending";

        List<PropertyResponse> cached = (List<PropertyResponse>) redis.opsForValue().get(key);
        if (cached != null) return cached;

        List<PropertyResponse> list = propertyClient.getPendingProperties().getResult();

        redis.opsForValue().set(key, list, 30, TimeUnit.SECONDS);

        return list;
    }

    public void approveProperty(String id) {
        propertyClient.approveProperty(id);
        redis.delete("property:pending");
        redis.delete("property:" + id);
    }

    public void rejectProperty(String id) {
        propertyClient.rejectProperty(id);
        redis.delete("property:pending");
        redis.delete("property:" + id);
    }

    public PropertyResponse getProperty(String id) {
        String key = "property:" + id;

        PropertyResponse cached = (PropertyResponse) redis.opsForValue().get(key);
        if (cached != null) return cached;

        PropertyResponse res = propertyClient.getProperty(id).getResult();

        redis.opsForValue().set(key, res, 60, TimeUnit.SECONDS);

        return res;
    }

    public void updateProperty(String id, PropertyResponse dto) {
        propertyClient.updateProperty(id, dto);
    }
}