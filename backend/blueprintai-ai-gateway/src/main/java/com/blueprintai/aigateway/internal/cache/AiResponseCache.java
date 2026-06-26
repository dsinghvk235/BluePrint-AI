package com.blueprintai.aigateway.internal.cache;

import com.blueprintai.aigateway.api.AiTaskType;
import java.util.Optional;

public interface AiResponseCache {

    String hashPrompt(String systemPrompt, String userPrompt, String promptId, String version);

    Optional<AiCacheService.CachedResponse> get(String promptHash);

    void put(String promptHash, AiCacheService.CachedResponse response, AiTaskType taskType);

    void invalidate(String promptHash);
}
