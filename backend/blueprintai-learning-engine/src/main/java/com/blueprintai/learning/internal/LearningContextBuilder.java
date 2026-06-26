package com.blueprintai.learning.internal;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

/** Builds architectural context from diagram canvas JSON — framework-agnostic. */
@Component
public class LearningContextBuilder {

    public DiagramContext buildContext(JsonNode canvasData) {
        List<CanvasNode> nodes = new ArrayList<>();
        List<CanvasEdge> edges = new ArrayList<>();

        JsonNode nodesNode = canvasData != null ? canvasData.get("nodes") : null;
        if (nodesNode != null && nodesNode.isArray()) {
            for (JsonNode node : nodesNode) {
                String id = textOr(node, "id", null);
                JsonNode data = node.get("data");
                if (id == null || data == null) {
                    continue;
                }
                nodes.add(new CanvasNode(
                        id,
                        textOr(data, "label", "Unnamed"),
                        textOr(data, "category", "custom"),
                        textOr(data, "technology", null),
                        textOr(data, "description", null),
                        textOr(data, "subtitle", null)));
            }
        }

        JsonNode edgesNode = canvasData != null ? canvasData.get("edges") : null;
        if (edgesNode != null && edgesNode.isArray()) {
            for (JsonNode edge : edgesNode) {
                String source = textOr(edge, "source", null);
                String target = textOr(edge, "target", null);
                if (source != null && target != null) {
                    JsonNode edgeData = edge.get("data");
                    String label = edgeData != null ? textOr(edgeData, "label", null) : null;
                    edges.add(new CanvasEdge(source, target, label));
                }
            }
        }

        return new DiagramContext(nodes, edges);
    }

    public Optional<CanvasNode> findNode(DiagramContext context, String nodeId) {
        return context.nodes().stream().filter(n -> n.id().equals(nodeId)).findFirst();
    }

    public String buildArchitectureSummary(DiagramContext context) {
        if (context.nodes().isEmpty()) {
            return "Empty architecture — add or generate components to begin learning.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Architecture with ").append(context.nodes().size()).append(" components and ")
                .append(context.edges().size())
                .append(" connections:\n");
        for (CanvasNode node : context.nodes()) {
            sb.append("- ")
                    .append(node.label())
                    .append(" (")
                    .append(node.category());
            if (node.technology() != null) {
                sb.append(", ").append(node.technology());
            }
            sb.append(")\n");
        }
        return sb.toString();
    }

    public String buildNodeContext(DiagramContext context, CanvasNode node) {
        Map<String, List<String>> upstream = new HashMap<>();
        Map<String, List<String>> downstream = new HashMap<>();

        for (CanvasEdge edge : context.edges()) {
            if (edge.target().equals(node.id())) {
                context.nodes().stream()
                        .filter(n -> n.id().equals(edge.source()))
                        .findFirst()
                        .ifPresent(source -> upstream
                                .computeIfAbsent(source.label(), k -> new ArrayList<>())
                                .add(edge.label() != null ? edge.label() : "connects to"));
            }
            if (edge.source().equals(node.id())) {
                context.nodes().stream()
                        .filter(n -> n.id().equals(edge.target()))
                        .findFirst()
                        .ifPresent(target -> downstream
                                .computeIfAbsent(target.label(), k -> new ArrayList<>())
                                .add(edge.label() != null ? edge.label() : "receives from"));
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Component: ").append(node.label()).append("\n");
        sb.append("Type: ").append(node.category()).append("\n");
        if (node.technology() != null) {
            sb.append("Technology: ").append(node.technology()).append("\n");
        }
        if (node.description() != null) {
            sb.append("Description: ").append(node.description()).append("\n");
        }
        if (!upstream.isEmpty()) {
            sb.append("Upstream: ").append(upstream).append("\n");
        }
        if (!downstream.isEmpty()) {
            sb.append("Downstream: ").append(downstream).append("\n");
        }
        sb.append("\nFull architecture:\n").append(buildArchitectureSummary(context));
        return sb.toString();
    }

    private static String textOr(JsonNode node, String field, String fallback) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return fallback;
        }
        return value.asText(fallback);
    }

    public record DiagramContext(List<CanvasNode> nodes, List<CanvasEdge> edges) {}

    public record CanvasNode(
            String id, String label, String category, String technology, String description, String subtitle) {}

    public record CanvasEdge(String source, String target, String label) {}
}
