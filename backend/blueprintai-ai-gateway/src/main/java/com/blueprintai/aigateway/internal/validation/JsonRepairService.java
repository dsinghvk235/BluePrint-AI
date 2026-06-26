package com.blueprintai.aigateway.internal.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/** Attempts to repair malformed JSON from LLM responses. */
@Component
public class JsonRepairService {

    private static final Pattern CODE_BLOCK_PATTERN =
            Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

    private final ObjectMapper objectMapper;

    public JsonRepairService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public JsonNode repair(String content) {
        if (content == null || content.isBlank()) {
            return null;
        }
        String trimmed = content.trim();

        JsonNode direct = tryParse(trimmed);
        if (direct != null) {
            return direct;
        }

        Matcher matcher = CODE_BLOCK_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            JsonNode fromBlock = tryParse(matcher.group(1).trim());
            if (fromBlock != null) {
                return fromBlock;
            }
        }

        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            JsonNode extracted = tryParse(trimmed.substring(start, end + 1));
            if (extracted != null) {
                return extracted;
            }
        }

        String fixed = trimmed
                .replaceAll(",\\s*}", "}")
                .replaceAll(",\\s*]", "]")
                .replaceAll("'", "\"");
        return tryParse(fixed);
    }

    private JsonNode tryParse(String content) {
        try {
            return objectMapper.readTree(content);
        } catch (Exception e) {
            return null;
        }
    }
}
