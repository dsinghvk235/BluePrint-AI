package com.blueprintai.learning.api.dto;

import com.blueprintai.learning.api.LearningLayer;
import java.util.List;

public record LayerContent(
        LearningLayer layer,
        String title,
        String summary,
        String content,
        List<String> bullets,
        List<String> principles,
        List<String> relatedConceptIds) {}
