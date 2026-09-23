package com.blueprintai.orchestrator.internal;

import java.util.UUID;

public record GenerationStartedEvent(UUID generationId, boolean useCache) {}
