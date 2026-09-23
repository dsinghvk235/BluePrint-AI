package com.blueprintai.diagram.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.UUID;

public record DiagramResponse(
        UUID id,
        UUID projectId,
        String name,
        int version,
        JsonNode canvasData,
        JsonNode versionMetadata,
        Instant createdAt,
        Instant updatedAt) {}
