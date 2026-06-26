package com.blueprintai.orchestrator.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Unified architecture model merged from all generators. */
public record ArchitectureModel(
        RequirementsSection requirements,
        List<JsonNode> functionalRequirements,
        List<JsonNode> nonFunctionalRequirements,
        JsonNode assumptions,
        JsonNode highLevelDesign,
        JsonNode lowLevelDesign,
        JsonNode databaseSchema,
        JsonNode apis,
        JsonNode security,
        JsonNode deployment,
        JsonNode scaling,
        JsonNode diagram,
        ArchitectureMetadata metadata) {

    public record RequirementsSection(String title, String summary, List<String> stakeholders, List<String> constraints) {}

    public record ArchitectureMetadata(
            String schemaVersion,
            Instant generatedAt,
            String systemDescription,
            String systemType,
            Map<String, String> generatorVersions) {}
}
