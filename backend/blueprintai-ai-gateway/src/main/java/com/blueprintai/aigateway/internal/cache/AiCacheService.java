package com.blueprintai.aigateway.internal.cache;

import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.config.AiGatewayProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class AiCacheService implements AiResponseCache {

    private static final String CACHE_PREFIX = "ai:response:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final AiGatewayProperties properties;
    private final Map<String, CachedResponse> memoryCache = new ConcurrentHashMap<>();

    public AiCacheService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            AiGatewayProperties properties) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    @Override
    public String hashPrompt(String systemPrompt, String userPrompt, String promptId, String version) {
        String combined = promptId + ":" + version + ":" + systemPrompt + ":" + userPrompt;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(combined.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            return Integer.toHexString(combined.hashCode());
        }
    }

    @Override
    public Optional<CachedResponse> get(String promptHash) {
        if (redisTemplate != null) {
            String value = redisTemplate.opsForValue().get(CACHE_PREFIX + promptHash);
            if (value != null) {
                try {
                    return Optional.of(objectMapper.readValue(value, CachedResponse.class));
                } catch (JsonProcessingException e) {
                    redisTemplate.delete(CACHE_PREFIX + promptHash);
                }
            }
            return Optional.empty();
        }
        return Optional.ofNullable(memoryCache.get(promptHash));
    }

    @Override
    public void put(String promptHash, CachedResponse response, AiTaskType taskType) {
        if (redisTemplate != null) {
            Duration ttl = taskType == AiTaskType.CHAT ? properties.getCacheTtlChat() : properties.getCacheTtl();
            try {
                String json = objectMapper.writeValueAsString(response);
                redisTemplate.opsForValue().set(CACHE_PREFIX + promptHash, json, ttl);
            } catch (JsonProcessingException ignored) {
                // Skip cache write on serialization failure
            }
            return;
        }
        memoryCache.put(promptHash, response);
    }

    @Override
    public void invalidate(String promptHash) {
        if (redisTemplate != null) {
            redisTemplate.delete(CACHE_PREFIX + promptHash);
        } else {
            memoryCache.remove(promptHash);
        }
    }

    public record CachedResponse(String content, String parsedJson) {}
}
