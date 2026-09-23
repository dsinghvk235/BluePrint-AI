package com.blueprintai.orchestrator.internal.generator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Locale;

/** Builds React-Flow-compatible diagram JSON from high-level design — no AI call required. */
public final class DiagramFromHighLevelDesignBuilder {

    private DiagramFromHighLevelDesignBuilder() {}

    public static ObjectNode build(JsonNode highLevelDesign, ObjectMapper objectMapper) {
        ObjectNode diagram = objectMapper.createObjectNode();
        ArrayNode nodes = diagram.putArray("nodes");
        ArrayNode connections = diagram.putArray("connections");

        if (highLevelDesign == null || highLevelDesign.isNull()) {
            return diagram;
        }

        JsonNode services = highLevelDesign.path("services");
        if (services.isArray()) {
            int index = 0;
            for (JsonNode service : services) {
                String id = service.path("id").asText("svc-" + index);
                String name = service.path("name").asText("Service " + (index + 1));
                String type = mapServiceType(service.path("type").asText("API"));
                String description = service.path("description").asText("");
                String technology = firstTechnology(service.path("technologies"));

                ObjectNode node = objectMapper.createObjectNode();
                node.put("id", id);
                node.put("type", type);
                node.put("label", name);
                ObjectNode metadata = node.putObject("metadata");
                metadata.put("description", description);
                if (!technology.isBlank()) {
                    metadata.put("technology", technology);
                }
                metadata.put("subtitle", service.path("scalingNotes").asText(""));
                nodes.add(node);
                index++;
            }
        }

        JsonNode hldConnections = highLevelDesign.path("connections");
        if (hldConnections.isArray()) {
            int edgeIndex = 0;
            for (JsonNode conn : hldConnections) {
                ObjectNode edge = objectMapper.createObjectNode();
                edge.put("id", conn.path("id").asText("edge-" + edgeIndex));
                edge.put("source", conn.path("source").asText());
                edge.put("target", conn.path("target").asText());
                String label = conn.path("protocol").asText("");
                if (label.isBlank()) {
                    label = conn.path("description").asText("flow");
                }
                edge.put("label", truncate(label, 60));
                edge.put("type", "default");
                connections.add(edge);
                edgeIndex++;
            }
        }

        return diagram;
    }

    private static String mapServiceType(String hldType) {
        return switch (hldType.toUpperCase(Locale.ROOT)) {
            case "GATEWAY", "API_GATEWAY" -> "api-gateway";
            case "DATABASE", "DB" -> "database";
            case "CACHE", "REDIS" -> "cache";
            case "QUEUE", "BROKER", "KAFKA" -> "queue";
            case "CLIENT", "FRONTEND", "MOBILE" -> "client";
            case "CDN" -> "cdn";
            case "AUTH", "AUTHENTICATION" -> "authentication";
            case "WORKER", "CONSUMER" -> "worker";
            case "LOAD_BALANCER", "LB" -> "load-balancer";
            case "STORAGE", "OBJECT_STORAGE", "S3" -> "storage";
            case "MONITORING", "OBSERVABILITY" -> "monitoring";
            case "API", "MICROSERVICE", "SERVICE" -> "microservice";
            default -> "service";
        };
    }

    private static String firstTechnology(JsonNode technologies) {
        if (technologies.isArray() && !technologies.isEmpty()) {
            return technologies.get(0).asText("");
        }
        return "";
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max - 3) + "...";
    }
}
