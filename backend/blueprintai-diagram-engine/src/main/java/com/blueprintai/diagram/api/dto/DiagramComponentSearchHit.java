package com.blueprintai.diagram.api.dto;

import java.util.UUID;

public record DiagramComponentSearchHit(
        UUID projectId, String projectName, String nodeId, String label, String nodeType, String technology) {}
