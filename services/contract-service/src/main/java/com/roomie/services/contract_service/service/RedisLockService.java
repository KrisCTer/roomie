package com.roomie.services.contract_service.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RedisLockService {
    StringRedisTemplate redis;

    public String tryLock(String key, long ttlSeconds) {
        String token = UUID.randomUUID().toString();
        Boolean ok = redis.opsForValue().setIfAbsent(key, token, Duration.ofSeconds(ttlSeconds));
        return Boolean.TRUE.equals(ok) ? token : null;
    }

    public boolean releaseLock(String key, String token) {
        String cur = redis.opsForValue().get(key);
        if (cur != null && cur.equals(token)) {
            redis.delete(key);
            return true;
        }
        return false;
    }
}
