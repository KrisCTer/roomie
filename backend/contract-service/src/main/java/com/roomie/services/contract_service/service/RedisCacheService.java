package com.roomie.services.contract_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RedisCacheService {
    StringRedisTemplate redis;
    ObjectMapper mapper;

    public <T> void put(String key, T obj, long ttlSeconds) {
        try {
            String json = mapper.writeValueAsString(obj);
            redis.opsForValue().set(key, json, Duration.ofSeconds(ttlSeconds));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public <T> Optional<T> get(String key, Class<T> clazz) {
        try {
            String json = redis.opsForValue().get(key);
            if (json == null) return Optional.empty();
            T o = mapper.readValue(json, clazz);
            return Optional.of(o);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void evict(String key) {
        redis.delete(key);
    }
}