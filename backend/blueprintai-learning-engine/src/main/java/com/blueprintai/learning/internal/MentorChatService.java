package com.blueprintai.learning.internal;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.aigateway.api.AiTaskType;
import com.blueprintai.aigateway.api.dto.AiCompletionRequest;
import com.blueprintai.aigateway.api.dto.AiCompletionResponse;
import com.blueprintai.learning.api.LearningMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/** AI-powered mentor chat — uses AiGateway only, never provider SDKs directly. */
@Service
public class MentorChatService {

    private static final Logger log = LoggerFactory.getLogger(MentorChatService.class);

    private final AiGatewayService aiGateway;
    private final LearningCacheService cacheService;

    public MentorChatService(AiGatewayService aiGateway, LearningCacheService cacheService) {
        this.aiGateway = aiGateway;
        this.cacheService = cacheService;
    }

    public MentorResult chat(
            String architectureContext,
            String nodeContext,
            LearningMode mode,
            String message,
            String conversationHistory,
            UUID userId,
            UUID projectId,
            String nodeId,
            boolean useCache) {
        String messageHash = hash(message + conversationHistory);
        String cacheKey = LearningCacheService.mentorKey(
                projectId.toString(), nodeId, mode.name(), messageHash);

        if (useCache) {
            var cached = cacheService.get(cacheKey, MentorResult.class);
            if (cached.isPresent()) {
                return cached.get().withCached(true);
            }
        }

        if (!aiGateway.isReady()) {
            return MentorResult.fallback(mode, message, nodeContext, architectureContext);
        }

        try {
            AiCompletionRequest request = AiCompletionRequest.builder()
                    .taskType(AiTaskType.CHAT)
                    .promptId("mentor-chat")
                    .promptVersion("1.0.0")
                    .generatorName("mentor-chat")
                    .variables(Map.of(
                            "architectureContext", architectureContext,
                            "nodeContext", nodeContext != null ? nodeContext : "No component selected",
                            "learningMode", mode.displayName(),
                            "toneGuidance", mode.toneGuidance(),
                            "conversationHistory", conversationHistory != null ? conversationHistory : "",
                            "message", message))
                    .userId(userId)
                    .projectId(projectId)
                    .correlationId(UUID.randomUUID())
                    .useCache(useCache)
                    .build();

            AiCompletionResponse response = aiGateway.complete(request);
            MentorResult result = new MentorResult(response.content(), buildContextSummary(nodeContext), false);
            if (useCache) {
                cacheService.put(cacheKey, result);
            }
            return result;
        } catch (Exception ex) {
            log.warn("Mentor chat AI call failed, using fallback: {}", ex.getMessage());
            return MentorResult.fallback(mode, message, nodeContext, architectureContext);
        }
    }

    private String buildContextSummary(String nodeContext) {
        if (nodeContext == null || nodeContext.isBlank()) {
            return "Full architecture context";
        }
        String firstLine = nodeContext.lines().findFirst().orElse("Selected component");
        return firstLine.length() > 80 ? firstLine.substring(0, 77) + "..." : firstLine;
    }

    private static String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of()
                    .formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)))
                    .substring(0, 16);
        } catch (Exception e) {
            return Integer.toHexString(input.hashCode());
        }
    }

    public record MentorResult(String response, String contextSummary, boolean cached) {
        public MentorResult withCached(boolean cached) {
            return new MentorResult(response, contextSummary, cached);
        }

        public static MentorResult fallback(
                LearningMode mode, String message, String nodeContext, String architectureContext) {
            String lower = message.toLowerCase();
            String response;
            if (lower.contains("why not") || lower.contains("instead")) {
                response = "Compare alternatives in the **Alternatives** layer of the learning panel. "
                        + "Each option has different trade-offs for scale, consistency, and operational cost. "
                        + mode.toneGuidance();
            } else if (lower.contains("beginner") || lower.contains("simple")) {
                response = "Switch to **Beginner** mode in the learning panel for simpler explanations. "
                        + (nodeContext != null ? "For this component: " + nodeContext.lines().findFirst().orElse("") : "");
            } else if (lower.contains("bottleneck") || lower.contains("improve")) {
                response = "Review components with many connections — they are often bottlenecks. "
                        + "Check the dependency explorer and trade-offs layer for each hot path. "
                        + architectureContext.lines().limit(5).reduce((a, b) -> a + "\n" + b).orElse("");
            } else if (nodeContext != null) {
                response = "Based on your architecture, focus on why this component exists in the topology, "
                        + "what it connects to, and which alternatives were considered. "
                        + "Explore the progressive learning layers for structured depth.\n\n"
                        + nodeContext.lines().limit(8).reduce((a, b) -> a + "\n" + b).orElse("");
            } else {
                response = "Select a component on the canvas for contextual guidance. "
                        + "Your architecture:\n"
                        + architectureContext.lines().limit(10).reduce((a, b) -> a + "\n" + b).orElse("");
            }
            return new MentorResult(response, "Knowledge-based mentor (AI unavailable)", false);
        }
    }
}
