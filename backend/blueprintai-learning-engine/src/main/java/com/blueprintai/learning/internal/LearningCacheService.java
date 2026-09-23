package com.blueprintai.learning.internal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** Caches learning explanations — Redis with in-memory fallback. */
@Service
public class LearningCacheService {

    private static final String PREFIX = "learning:";
    private static final Duration TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final Map<String, CachedEntry> memoryCache = new ConcurrentHashMap<>();

    public LearningCacheService(
            @Autowired(required = false) StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public <T> Optional<T> get(String key, Class<T> type) {
        if (redisTemplate != null) {
            String value = redisTemplate.opsForValue().get(PREFIX + key);
            if (value != null) {
                try {
                    return Optional.of(objectMapper.readValue(value, type));
                } catch (JsonProcessingException e) {
                    redisTemplate.delete(PREFIX + key);
                }
            }
            return Optional.empty();
        }
        CachedEntry entry = memoryCache.get(key);
        if (entry != null && !entry.isExpired()) {
            try {
                return Optional.of(objectMapper.readValue(entry.json(), type));
            } catch (JsonProcessingException e) {
                memoryCache.remove(key);
            }
        }
        return Optional.empty();
    }

    public <T> void put(String key, T value) {
        try {
            String json = objectMapper.writeValueAsString(value);
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(PREFIX + key, json, TTL);
            } else {
                memoryCache.put(key, new CachedEntry(json, System.currentTimeMillis() + TTL.toMillis()));
            }
        } catch (JsonProcessingException ignored) {
            // Skip cache write
        }
    }

    public void invalidate(String key) {
        if (redisTemplate != null) {
            redisTemplate.delete(PREFIX + key);
        } else {
            memoryCache.remove(key);
        }
    }

    public static String componentKey(String projectId, String nodeId, String mode) {
        return "component:" + projectId + ":" + nodeId + ":" + mode;
    }

    public static String mentorKey(String projectId, String nodeId, String mode, String messageHash) {
        return "mentor:" + projectId + ":" + (nodeId != null ? nodeId : "all") + ":" + mode + ":" + messageHash;
    }

    private record CachedEntry(String json, long expiresAt) {
        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }
}
