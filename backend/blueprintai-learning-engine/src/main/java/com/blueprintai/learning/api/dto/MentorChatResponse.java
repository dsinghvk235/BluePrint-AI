package com.blueprintai.learning.api.dto;

import java.util.UUID;

public record MentorChatResponse(UUID messageId, String response, String contextSummary, boolean cached) {}
