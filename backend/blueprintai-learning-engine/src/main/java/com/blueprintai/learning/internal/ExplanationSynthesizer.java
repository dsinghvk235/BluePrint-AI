package com.blueprintai.learning.internal;

import com.blueprintai.knowledge.api.dto.KnowledgeConcept;
import com.blueprintai.learning.api.LearningLayer;
import com.blueprintai.learning.api.LearningMode;
import com.blueprintai.learning.api.dto.DecisionLogEntry;
import com.blueprintai.learning.api.dto.LayerContent;
import com.blueprintai.learning.internal.LearningContextBuilder.CanvasNode;
import com.blueprintai.learning.internal.LearningContextBuilder.DiagramContext;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Synthesizes layer content from knowledge corpus + diagram context — no AI required. */
@Component
public class ExplanationSynthesizer {

    public List<LayerContent> synthesizeLayers(
            KnowledgeConcept concept,
            CanvasNode node,
            DiagramContext context,
            LearningMode mode) {
        List<LayerContent> layers = new ArrayList<>();
        for (LearningLayer layer : LearningLayer.values()) {
            layers.add(buildLayer(layer, concept, node, context, mode));
        }
        return layers;
    }

    public LayerContent buildLayer(
            LearningLayer layer,
            KnowledgeConcept concept,
            CanvasNode node,
            DiagramContext context,
            LearningMode mode) {
        return switch (layer) {
            case OVERVIEW -> overviewLayer(concept, node, mode);
            case PURPOSE -> purposeLayer(concept, node, mode);
            case REASONING -> reasoningLayer(concept, node, context, mode);
            case PRINCIPLE -> principleLayer(concept, mode);
            case TRADEOFFS -> tradeoffsLayer(concept, node, mode);
            case ALTERNATIVES -> alternativesLayer(concept, node, mode);
            case BEST_PRACTICES -> bestPracticesLayer(concept, mode);
            case INTERVIEW -> interviewLayer(concept, node, mode);
            case ADVANCED -> advancedLayer(concept, node, context, mode);
        };
    }

    public DecisionLogEntry buildDecisionLog(KnowledgeConcept concept, CanvasNode node, DiagramContext context) {
        List<DecisionLogEntry.AlternativeConsidered> alternatives = new ArrayList<>();
        if (concept.alternatives() != null) {
            for (KnowledgeConcept.Alternative alt : concept.alternatives()) {
                String selected = node.technology() != null
                                && alt.name().toLowerCase().contains(node.technology().toLowerCase())
                        ? "Selected for this architecture"
                        : "Not selected — " + alt.whenToUse();
                alternatives.add(new DecisionLogEntry.AlternativeConsidered(alt.name(), selected));
            }
        }

        String decision = node.technology() != null
                ? "Use " + node.technology() + " as the " + concept.name() + " component"
                : "Deploy a " + concept.name() + " component (" + node.label() + ")";

        return new DecisionLogEntry(
                UUID.randomUUID().toString(),
                node.id(),
                node.label(),
                decision,
                contextualReason(node, context, concept),
                concept.engineeringPrinciples() != null && !concept.engineeringPrinciples().isEmpty()
                        ? concept.engineeringPrinciples().getFirst()
                        : "Fit for purpose",
                List.of(
                        "Architecture generated for the described system",
                        node.technology() != null
                                ? "Technology preference: " + node.technology()
                                : "Category-driven selection: " + node.category()),
                alternatives,
                concept.tradeoffs() != null ? concept.tradeoffs() : List.of(),
                concept.commonMistakes() != null ? concept.commonMistakes() : List.of(),
                List.of(
                        "Monitor performance under production load",
                        "Re-evaluate when scale requirements change",
                        "Consider " + concept.name() + " alternatives during major redesigns"));
    }

    private LayerContent overviewLayer(KnowledgeConcept concept, CanvasNode node, LearningMode mode) {
        String summary = switch (mode) {
            case BEGINNER -> node.label() + " is a " + plainName(concept) + " in your system.";
            case STAFF_ENGINEER -> node.label() + " — " + concept.name() + " within system boundaries.";
            default -> node.label() + ": " + concept.name() + " component";
        };
        String content = adaptDepth(mode, concept.overview());
        return new LayerContent(
                LearningLayer.OVERVIEW,
                "What is " + node.label() + "?",
                summary,
                content,
                List.of(node.category(), concept.name()),
                List.of(),
                concept.relatedConcepts());
    }

    private LayerContent purposeLayer(KnowledgeConcept concept, CanvasNode node, LearningMode mode) {
        return new LayerContent(
                LearningLayer.PURPOSE,
                "Why is " + node.label() + " used?",
                "Solves a core " + concept.category() + " need in this architecture.",
                adaptDepth(mode, concept.purpose()),
                List.of("Problem: " + extractProblem(concept)),
                concept.engineeringPrinciples(),
                concept.relatedConcepts());
    }

    private LayerContent reasoningLayer(
            KnowledgeConcept concept, CanvasNode node, DiagramContext context, LearningMode mode) {
        String reasoning = contextualReason(node, context, concept);
        return new LayerContent(
                LearningLayer.REASONING,
                "Why was it selected here?",
                node.technology() != null
                        ? node.technology() + " chosen for " + node.label()
                        : concept.name() + " fits this architecture's needs",
                adaptDepth(mode, reasoning),
                neighborBullets(node, context),
                List.of(),
                concept.relatedConcepts());
    }

    private LayerContent principleLayer(KnowledgeConcept concept, LearningMode mode) {
        return new LayerContent(
                LearningLayer.PRINCIPLE,
                "Engineering Principles",
                "Patterns and principles behind " + concept.name(),
                adaptDepth(mode, joinPrinciples(concept)),
                concept.designPatterns(),
                concept.engineeringPrinciples(),
                concept.relatedConcepts());
    }

    private LayerContent tradeoffsLayer(KnowledgeConcept concept, CanvasNode node, LearningMode mode) {
        List<String> bullets = new ArrayList<>();
        if (concept.advantages() != null) {
            bullets.addAll(concept.advantages().stream().map(a -> "✓ " + a).toList());
        }
        if (concept.disadvantages() != null) {
            bullets.addAll(concept.disadvantages().stream().map(d -> "✗ " + d).toList());
        }
        return new LayerContent(
                LearningLayer.TRADEOFFS,
                "Trade-offs for " + node.label(),
                "Every choice has costs and benefits.",
                adaptDepth(mode, String.join("\n", concept.tradeoffs() != null ? concept.tradeoffs() : List.of())),
                bullets,
                List.of(),
                concept.relatedConcepts());
    }

    private LayerContent alternativesLayer(KnowledgeConcept concept, CanvasNode node, LearningMode mode) {
        List<String> bullets = concept.alternatives() != null
                ? concept.alternatives().stream()
                        .map(a -> a.name() + ": " + a.description() + " — " + a.whenToUse())
                        .toList()
                : List.of();
        String content = mode == LearningMode.BEGINNER
                ? "Other tools could work too. Here are common alternatives and when teams pick them."
                : bullets.stream().collect(Collectors.joining("\n"));
        return new LayerContent(
                LearningLayer.ALTERNATIVES,
                "What else could work?",
                "Compare viable alternatives to " + (node.technology() != null ? node.technology() : concept.name()),
                content,
                bullets,
                List.of(),
                concept.relatedConcepts());
    }

    private LayerContent bestPracticesLayer(KnowledgeConcept concept, LearningMode mode) {
        List<String> practices = new ArrayList<>();
        if (concept.commonMistakes() != null) {
            practices.addAll(concept.commonMistakes().stream()
                    .map(m -> "Avoid: " + m)
                    .toList());
        }
        if (concept.realWorldExamples() != null) {
            practices.addAll(concept.realWorldExamples().stream()
                    .map(e -> "Example: " + e)
                    .toList());
        }
        return new LayerContent(
                LearningLayer.BEST_PRACTICES,
                "Best Practices",
                "Learn from production experience.",
                adaptDepth(mode, "Follow established patterns and avoid common pitfalls."),
                practices,
                concept.solidPrinciples(),
                concept.relatedConcepts());
    }

    private LayerContent interviewLayer(KnowledgeConcept concept, CanvasNode node, LearningMode mode) {
        List<String> questions = concept.interviewQuestions() != null ? concept.interviewQuestions() : List.of();
        List<String> contextual = new ArrayList<>(questions);
        contextual.add("Why would you use " + node.label() + " in this specific architecture?");
        if (node.technology() != null) {
            contextual.add("Why " + node.technology() + " instead of an alternative?");
        }
        return new LayerContent(
                LearningLayer.INTERVIEW,
                "Interview Questions",
                "Practice explaining " + node.label() + " in system design interviews.",
                mode.ordinal() >= LearningMode.SDE_1.ordinal()
                        ? "Be ready to whiteboard " + node.label() + "'s role, failures, and scale limits."
                        : "Try answering these out loud to build confidence.",
                contextual,
                List.of(),
                concept.relatedConcepts());
    }

    private LayerContent advancedLayer(
            KnowledgeConcept concept, CanvasNode node, DiagramContext context, LearningMode mode) {
        String content = switch (mode) {
            case BEGINNER, INTERMEDIATE -> "Advanced topics unlock at Senior Engineer mode and above.";
            case SDE_1 -> "Consider failure modes, observability, and capacity planning for " + node.label() + ".";
            case SENIOR_ENGINEER -> "Evaluate "
                    + node.label()
                    + " under partition, regional failover, and 10x traffic scenarios. "
                    + "References: "
                    + (concept.references() != null ? String.join(", ", concept.references()) : "industry guides");
            case STAFF_ENGINEER -> "Strategic view: how "
                    + node.label()
                    + " affects team boundaries, cost model, and multi-year evolution. "
                    + "Cross-cutting concerns with "
                    + context.nodes().size()
                    + " components. "
                    + "Challenge assumptions in the current topology.";
        };
        return new LayerContent(
                LearningLayer.ADVANCED,
                "Advanced Discussion",
                "Deep engineering analysis",
                content,
                concept.references(),
                List.of(),
                concept.relatedConcepts());
    }

    private String contextualReason(CanvasNode node, DiagramContext context, KnowledgeConcept concept) {
        long inbound = context.edges().stream().filter(e -> e.target().equals(node.id())).count();
        long outbound = context.edges().stream().filter(e -> e.source().equals(node.id())).count();
        StringBuilder sb = new StringBuilder();
        sb.append(node.label())
                .append(" was placed as a ")
                .append(concept.name())
                .append(" with ");
        sb.append(inbound).append(" inbound and ").append(outbound).append(" outbound connections. ");
        if (node.technology() != null) {
            sb.append("Technology ").append(node.technology()).append(" aligns with ").append(concept.name())
                    .append(" requirements. ");
        }
        sb.append("In this topology, it ").append(roleInArchitecture(inbound, outbound)).append(".");
        return sb.toString();
    }

    private String roleInArchitecture(long inbound, long outbound) {
        if (inbound > 2 && outbound > 2) {
            return "acts as a central hub — monitor for bottlenecks";
        }
        if (outbound == 0 && inbound > 0) {
            return "is a terminal/sink component (e.g., database, storage)";
        }
        if (inbound == 0 && outbound > 0) {
            return "is an entry point (e.g., client, gateway)";
        }
        return "participates in the request/data flow between services";
    }

    private List<String> neighborBullets(CanvasNode node, DiagramContext context) {
        List<String> bullets = new ArrayList<>();
        context.edges().stream()
                .filter(e -> e.target().equals(node.id()))
                .forEach(e -> context.nodes().stream()
                        .filter(n -> n.id().equals(e.source()))
                        .findFirst()
                        .ifPresent(n -> bullets.add("Receives from: " + n.label())));
        context.edges().stream()
                .filter(e -> e.source().equals(node.id()))
                .forEach(e -> context.nodes().stream()
                        .filter(n -> n.id().equals(e.target()))
                        .findFirst()
                        .ifPresent(n -> bullets.add("Sends to: " + n.label())));
        return bullets;
    }

    private String adaptDepth(LearningMode mode, String text) {
        if (text == null) {
            return "";
        }
        return switch (mode) {
            case BEGINNER -> simplify(text);
            case STAFF_ENGINEER -> text + " Consider organizational and multi-year evolution implications.";
            default -> text;
        };
    }

    private String simplify(String text) {
        return text.replace("ACID", "reliable transactions (ACID)")
                .replace("eventual consistency", "data may be briefly out of sync (eventual consistency)");
    }

    private String plainName(KnowledgeConcept concept) {
        return concept.name().toLowerCase();
    }

    private String extractProblem(KnowledgeConcept concept) {
        return concept.purpose() != null
                ? concept.purpose().split("\\.")[0]
                : "system requirement";
    }

    private String joinPrinciples(KnowledgeConcept concept) {
        List<String> parts = new ArrayList<>();
        if (concept.engineeringPrinciples() != null) {
            parts.addAll(concept.engineeringPrinciples());
        }
        if (concept.designPatterns() != null) {
            parts.add("Patterns: " + String.join(", ", concept.designPatterns()));
        }
        if (concept.solidPrinciples() != null && !concept.solidPrinciples().isEmpty()) {
            parts.add("SOLID: " + String.join(", ", concept.solidPrinciples()));
        }
        return String.join("\n", parts);
    }
}
