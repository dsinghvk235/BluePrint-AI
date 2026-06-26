package com.blueprintai.orchestrator.internal;

import com.blueprintai.orchestrator.api.dto.ArchitectureModel;
import com.blueprintai.orchestrator.internal.entity.ArchitectureGeneration;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class ArchitectureModelMapper {

    private ArchitectureModelMapper() {}

    public static ArchitectureModel fromJson(JsonNode node, String systemDescription, String systemType) {
        if (node == null || node.isNull()) {
            return empty(systemDescription, systemType);
        }
        ArchitectureModel.RequirementsSection requirements = null;
        if (node.has("requirements")) {
            JsonNode req = node.get("requirements");
            requirements = new ArchitectureModel.RequirementsSection(
                    text(req, "title"),
                    text(req, "summary"),
                    stringList(req, "stakeholders"),
                    stringList(req, "constraints"));
        }
        return new ArchitectureModel(
                requirements,
                jsonList(node, "functionalRequirements"),
                jsonList(node, "nonFunctionalRequirements"),
                node.get("assumptions"),
                node.get("highLevelDesign"),
                node.get("lowLevelDesign"),
                node.get("databaseSchema"),
                node.get("apis"),
                node.get("security"),
                node.get("deployment"),
                node.get("scaling"),
                node.get("diagram"),
                metadata(node, systemDescription, systemType));
    }

    public static ArchitectureModel empty(String systemDescription, String systemType) {
        return new ArchitectureModel(
                null, List.of(), List.of(), null, null, null, null, null, null, null, null, null,
                new ArchitectureModel.ArchitectureMetadata("1.0", Instant.now(), systemDescription, systemType, Map.of()));
    }

    public static JsonNode toJson(ArchitectureModel model, ObjectMapper objectMapper) {
        Map<String, Object> map = new HashMap<>();
        if (model.requirements() != null) {
            map.put("requirements", Map.of(
                    "title", model.requirements().title(),
                    "summary", model.requirements().summary(),
                    "stakeholders", model.requirements().stakeholders(),
                    "constraints", model.requirements().constraints()));
        }
        map.put("functionalRequirements", model.functionalRequirements());
        map.put("nonFunctionalRequirements", model.nonFunctionalRequirements());
        putIfNotNull(map, "assumptions", model.assumptions());
        putIfNotNull(map, "highLevelDesign", model.highLevelDesign());
        putIfNotNull(map, "lowLevelDesign", model.lowLevelDesign());
        putIfNotNull(map, "databaseSchema", model.databaseSchema());
        putIfNotNull(map, "apis", model.apis());
        putIfNotNull(map, "security", model.security());
        putIfNotNull(map, "deployment", model.deployment());
        putIfNotNull(map, "scaling", model.scaling());
        putIfNotNull(map, "diagram", model.diagram());
        if (model.metadata() != null) {
            map.put("metadata", Map.of(
                    "schemaVersion", model.metadata().schemaVersion(),
                    "generatedAt", model.metadata().generatedAt().toString(),
                    "systemDescription", model.metadata().systemDescription(),
                    "systemType", model.metadata().systemType(),
                    "generatorVersions", model.metadata().generatorVersions()));
        }
        return objectMapper.valueToTree(map);
    }

    public static ArchitectureModel fromGeneration(ArchitectureGeneration generation, ObjectMapper objectMapper) {
        return fromJson(generation.getArchitecturePayload(), generation.getSystemDescription(), generation.getSystemType());
    }

    private static void putIfNotNull(Map<String, Object> map, String key, JsonNode value) {
        if (value != null && !value.isNull()) {
            map.put(key, value);
        }
    }

    private static String text(JsonNode node, String field) {
        return node.has(field) ? node.get(field).asText() : "";
    }

    private static List<String> stringList(JsonNode node, String field) {
        List<String> list = new ArrayList<>();
        if (node.has(field) && node.get(field).isArray()) {
            node.get(field).forEach(n -> list.add(n.asText()));
        }
        return list;
    }

    private static List<JsonNode> jsonList(JsonNode node, String field) {
        List<JsonNode> list = new ArrayList<>();
        if (node.has(field) && node.get(field).isArray()) {
            node.get(field).forEach(list::add);
        }
        return list;
    }

    private static ArchitectureModel.ArchitectureMetadata metadata(
            JsonNode node, String systemDescription, String systemType) {
        if (node.has("metadata")) {
            JsonNode meta = node.get("metadata");
            Map<String, String> versions = new HashMap<>();
            if (meta.has("generatorVersions")) {
                meta.get("generatorVersions").fields().forEachRemaining(e -> versions.put(e.getKey(), e.getValue().asText()));
            }
            return new ArchitectureModel.ArchitectureMetadata(
                    meta.path("schemaVersion").asText("1.0"),
                    Instant.parse(meta.path("generatedAt").asText(Instant.now().toString())),
                    meta.path("systemDescription").asText(systemDescription),
                    meta.path("systemType").asText(systemType),
                    versions);
        }
        return new ArchitectureModel.ArchitectureMetadata("1.0", Instant.now(), systemDescription, systemType, Map.of());
    }
}
