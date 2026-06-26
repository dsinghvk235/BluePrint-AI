package com.blueprintai.learning.api.dto;

import java.util.List;

public record DecisionLogEntry(
        String id,
        String nodeId,
        String component,
        String decision,
        String reason,
        String engineeringPrinciple,
        List<String> assumptions,
        List<AlternativeConsidered> alternativesConsidered,
        List<String> tradeoffs,
        List<String> potentialRisks,
        List<String> futureImprovements) {

    public record AlternativeConsidered(String name, String reasonRejected) {}
}
