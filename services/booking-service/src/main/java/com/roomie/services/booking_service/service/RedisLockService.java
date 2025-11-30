package com.roomie.services.booking_service.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.UUID;

@Component
public class RedisLockService {
    private final StringRedisTemplate redis;
    public RedisLockService(StringRedisTemplate redis) { this.redis = redis; }

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
