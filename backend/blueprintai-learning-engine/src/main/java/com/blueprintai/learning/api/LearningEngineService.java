package com.blueprintai.learning.api;

import com.blueprintai.learning.api.dto.ArchitectureOverviewResponse;
import com.blueprintai.learning.api.dto.ComponentKnowledgeResponse;
import com.blueprintai.learning.api.dto.DecisionLogEntry;
import com.blueprintai.learning.api.dto.DependencyGraph;
import com.blueprintai.learning.api.dto.GetComponentKnowledgeRequest;
import com.blueprintai.learning.api.dto.MentorChatRequest;
import com.blueprintai.learning.api.dto.MentorChatResponse;
import java.util.List;
import java.util.UUID;

/** Learning Engine public contract — no React or provider SDK dependencies. */
public interface LearningEngineService {

    String getModuleName();

    boolean isReady();

    ComponentKnowledgeResponse getComponentKnowledge(GetComponentKnowledgeRequest request, UUID userId);

    ArchitectureOverviewResponse getArchitectureOverview(UUID projectId, LearningMode mode, UUID userId);

    List<DecisionLogEntry> getDecisionLogs(UUID projectId, String nodeId, UUID userId);

    DependencyGraph getDependencies(UUID projectId, String nodeId, UUID userId);

    MentorChatResponse mentorChat(MentorChatRequest request, UUID userId);
}
