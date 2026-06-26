package com.blueprintai.learning.api.dto;

import java.util.List;

public record DependencyGraph(
        List<DependencyNode> upstream, List<DependencyNode> downstream) {

    public record DependencyNode(String nodeId, String label, String category, String relationship) {}
}
