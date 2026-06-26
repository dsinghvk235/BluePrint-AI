package com.blueprintai.learning.internal;

import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.diagram.api.DiagramService;
import com.blueprintai.diagram.api.dto.DiagramResponse;
import com.blueprintai.knowledge.api.KnowledgeService;
import com.blueprintai.knowledge.api.dto.KnowledgeConcept;
import com.blueprintai.learning.api.LearningEngineService;
import com.blueprintai.learning.api.LearningLayer;
import com.blueprintai.learning.api.LearningMode;
import com.blueprintai.learning.api.dto.ArchitectureOverviewResponse;
import com.blueprintai.learning.api.dto.ComponentKnowledgeResponse;
import com.blueprintai.learning.api.dto.DecisionLogEntry;
import com.blueprintai.learning.api.dto.DependencyGraph;
import com.blueprintai.learning.api.dto.GetComponentKnowledgeRequest;
import com.blueprintai.learning.api.dto.LayerContent;
import com.blueprintai.learning.api.dto.MentorChatRequest;
import com.blueprintai.learning.api.dto.MentorChatResponse;
import com.blueprintai.learning.internal.LearningContextBuilder.CanvasNode;
import com.blueprintai.learning.internal.LearningContextBuilder.DiagramContext;
import com.blueprintai.learning.internal.MentorChatService.MentorResult;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LearningEngineServiceImpl implements LearningEngineService {

    private static final String MODULE_NAME = "learning-engine";

    private final DiagramService diagramService;
    private final KnowledgeService knowledgeService;
    private final LearningContextBuilder contextBuilder;
    private final ExplanationSynthesizer synthesizer;
    private final LearningCacheService cacheService;
    private final MentorChatService mentorChatService;

    public LearningEngineServiceImpl(
            DiagramService diagramService,
            KnowledgeService knowledgeService,
            LearningContextBuilder contextBuilder,
            ExplanationSynthesizer synthesizer,
            LearningCacheService cacheService,
            MentorChatService mentorChatService) {
        this.diagramService = diagramService;
        this.knowledgeService = knowledgeService;
        this.contextBuilder = contextBuilder;
        this.synthesizer = synthesizer;
        this.cacheService = cacheService;
        this.mentorChatService = mentorChatService;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return knowledgeService.isReady();
    }

    @Override
    @Transactional(readOnly = true)
    public ComponentKnowledgeResponse getComponentKnowledge(GetComponentKnowledgeRequest request, UUID userId) {
        DiagramContext context = loadContext(request.projectId(), userId);
        CanvasNode node = contextBuilder
                .findNode(context, request.nodeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Node not found on canvas"));

        String cacheKey = LearningCacheService.componentKey(
                request.projectId().toString(), request.nodeId(), request.mode().name());

        if (request.useCache()) {
            var cached = cacheService.get(cacheKey, ComponentKnowledgeResponse.class);
            if (cached.isPresent()) {
                ComponentKnowledgeResponse response = cached.get();
                if (request.layer() != null) {
                    return filterToLayer(response, request.layer(), true);
                }
                return new ComponentKnowledgeResponse(
                        response.nodeId(),
                        response.label(),
                        response.category(),
                        response.technology(),
                        response.conceptId(),
                        response.mode(),
                        response.layers(),
                        response.decisionLog(),
                        response.dependencies(),
                        response.source(),
                        true);
            }
        }

        KnowledgeConcept concept = knowledgeService
                .resolveConcept(node.technology(), node.category())
                .orElse(fallbackConcept(node));

        List<LayerContent> layers = synthesizer.synthesizeLayers(concept, node, context, request.mode());
        DecisionLogEntry decisionLog = synthesizer.buildDecisionLog(concept, node, context);
        DependencyGraph dependencies = buildDependencies(context, node);

        ComponentKnowledgeResponse response = new ComponentKnowledgeResponse(
                node.id(),
                node.label(),
                node.category(),
                node.technology(),
                concept.id(),
                request.mode(),
                layers,
                decisionLog,
                dependencies,
                "knowledge",
                false);

        if (request.useCache()) {
            cacheService.put(cacheKey, response);
        }

        if (request.layer() != null) {
            return filterToLayer(response, request.layer(), false);
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ArchitectureOverviewResponse getArchitectureOverview(UUID projectId, LearningMode mode, UUID userId) {
        DiagramContext context = loadContext(projectId, userId);
        List<ArchitectureOverviewResponse.ComponentSummary> components = context.nodes().stream()
                .map(n -> new ArchitectureOverviewResponse.ComponentSummary(
                        n.id(), n.label(), n.category(), inferRole(n, context)))
                .toList();

        List<String> keyDecisions = context.nodes().stream()
                .map(n -> knowledgeService
                        .resolveConcept(n.technology(), n.category())
                        .map(c -> n.label() + ": " + c.name())
                        .orElse(n.label() + ": " + n.category()))
                .limit(8)
                .toList();

        List<String> explorations = List.of(
                "Click any component to open progressive learning layers",
                "Switch learning modes to adjust explanation depth",
                "Use the AI Mentor to ask 'why' questions",
                "Explore upstream/downstream dependencies");

        return new ArchitectureOverviewResponse(
                contextBuilder.buildArchitectureSummary(context), mode, components, keyDecisions, explorations);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DecisionLogEntry> getDecisionLogs(UUID projectId, String nodeId, UUID userId) {
        DiagramContext context = loadContext(projectId, userId);
        List<CanvasNode> targets = nodeId != null
                ? contextBuilder.findNode(context, nodeId).map(List::of).orElse(List.of())
                : context.nodes();

        return targets.stream()
                .map(node -> {
                    KnowledgeConcept concept = knowledgeService
                            .resolveConcept(node.technology(), node.category())
                            .orElse(fallbackConcept(node));
                    return synthesizer.buildDecisionLog(concept, node, context);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DependencyGraph getDependencies(UUID projectId, String nodeId, UUID userId) {
        DiagramContext context = loadContext(projectId, userId);
        CanvasNode node = contextBuilder
                .findNode(context, nodeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Node not found"));
        return buildDependencies(context, node);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorChatResponse mentorChat(MentorChatRequest request, UUID userId) {
        DiagramContext context = loadContext(request.projectId(), userId);
        String architectureContext = contextBuilder.buildArchitectureSummary(context);

        String nodeContext = null;
        if (request.nodeId() != null) {
            nodeContext = contextBuilder
                    .findNode(context, request.nodeId())
                    .map(n -> contextBuilder.buildNodeContext(context, n))
                    .orElse(null);
        }

        String history = request.history() != null
                ? request.history().stream()
                        .map(m -> m.role() + ": " + m.content())
                        .collect(Collectors.joining("\n"))
                : "";

        MentorResult result = mentorChatService.chat(
                architectureContext,
                nodeContext,
                request.mode(),
                request.message(),
                history,
                userId,
                request.projectId(),
                request.nodeId(),
                request.useCache());

        return new MentorChatResponse(UUID.randomUUID(), result.response(), result.contextSummary(), result.cached());
    }

    private DiagramContext loadContext(UUID projectId, UUID userId) {
        DiagramResponse diagram = diagramService.getDiagramByProject(projectId, userId);
        return contextBuilder.buildContext(diagram.canvasData());
    }

    private DependencyGraph buildDependencies(DiagramContext context, CanvasNode node) {
        List<DependencyGraph.DependencyNode> upstream = new ArrayList<>();
        List<DependencyGraph.DependencyNode> downstream = new ArrayList<>();

        for (var edge : context.edges()) {
            if (edge.target().equals(node.id())) {
                context.nodes().stream()
                        .filter(n -> n.id().equals(edge.source()))
                        .findFirst()
                        .ifPresent(n -> upstream.add(new DependencyGraph.DependencyNode(
                                n.id(), n.label(), n.category(), edge.label() != null ? edge.label() : "feeds")));
            }
            if (edge.source().equals(node.id())) {
                context.nodes().stream()
                        .filter(n -> n.id().equals(edge.target()))
                        .findFirst()
                        .ifPresent(n -> downstream.add(new DependencyGraph.DependencyNode(
                                n.id(), n.label(), n.category(), edge.label() != null ? edge.label() : "receives")));
            }
        }
        return new DependencyGraph(upstream, downstream);
    }

    private ComponentKnowledgeResponse filterToLayer(
            ComponentKnowledgeResponse full, LearningLayer layer, boolean cached) {
        List<LayerContent> filtered = full.layers().stream()
                .filter(l -> l.layer() == layer)
                .toList();
        return new ComponentKnowledgeResponse(
                full.nodeId(),
                full.label(),
                full.category(),
                full.technology(),
                full.conceptId(),
                full.mode(),
                filtered,
                full.decisionLog(),
                full.dependencies(),
                full.source(),
                cached);
    }

    private String inferRole(CanvasNode node, DiagramContext context) {
        long inbound = context.edges().stream().filter(e -> e.target().equals(node.id())).count();
        long outbound = context.edges().stream().filter(e -> e.source().equals(node.id())).count();
        if (inbound == 0 && outbound > 0) {
            return "entry-point";
        }
        if (outbound == 0 && inbound > 0) {
            return "data-sink";
        }
        if (inbound > 2 || outbound > 2) {
            return "hub";
        }
        return "middleware";
    }

    private KnowledgeConcept fallbackConcept(CanvasNode node) {
        return new KnowledgeConcept(
                node.category(),
                node.label(),
                node.category(),
                List.of(node.category()),
                node.description() != null ? node.description() : node.label() + " is a " + node.category() + " component.",
                "Provides " + node.category() + " capabilities in this architecture.",
                List.of("Separation of concerns", "Single responsibility"),
                List.of("Component pattern"),
                List.of(),
                List.of("Focused responsibility", "Clear boundaries"),
                List.of("Adds network hop if over-decomposed"),
                List.of("Complexity vs autonomy"),
                List.of(),
                List.of("Common in cloud-native systems"),
                List.of("Unclear boundaries between components"),
                List.of("What is the responsibility of " + node.label() + "?"),
                List.of(),
                List.of("System design fundamentals"));
    }
}
