package com.blueprintai.diagram.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record SaveDiagramRequest(
        @NotNull JsonNode canvasData,
        JsonNode versionMetadata,
        Integer expectedVersion) {}
