package com.blueprintai.orchestrator.api.dto;

import java.util.UUID;

public record ContinueConversationResponse(UUID messageId, String response, UUID correlationId) {}
