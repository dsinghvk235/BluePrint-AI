package com.blueprintai.aigateway.internal.validation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Validates AI JSON responses against expected schema structures. */
@Component
public class ResponseValidator {

    private final ObjectMapper objectMapper;

    public ResponseValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ValidationResult validate(JsonNode data, JsonNode schema) {
        List<String> errors = new ArrayList<>();
        validateNode(data, schema, "", errors);
        return new ValidationResult(errors.isEmpty(), errors);
    }

    public ValidationResult validateRequiredFields(JsonNode data, List<String> requiredFields) {
        List<String> errors = new ArrayList<>();
        for (String field : requiredFields) {
            if (!data.has(field) || data.get(field).isNull()) {
                errors.add("Missing required field: " + field);
            }
        }
        return new ValidationResult(errors.isEmpty(), errors);
    }

    public JsonNode parseJson(String content) {
        try {
            return objectMapper.readTree(content);
        } catch (Exception e) {
            return null;
        }
    }

    private void validateNode(JsonNode data, JsonNode schema, String path, List<String> errors) {
        if (schema == null || schema.isEmpty()) {
            return;
        }
        if (schema.has("required") && schema.get("required").isArray()) {
            for (JsonNode field : schema.get("required")) {
                String fieldName = field.asText();
                if (!data.has(fieldName) || data.get(fieldName).isNull()) {
                    errors.add(path + fieldName);
                }
            }
        }
        if (schema.has("properties") && data.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = schema.get("properties").fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                if (data.has(entry.getKey())) {
                    validateNode(data.get(entry.getKey()), entry.getValue(), path + entry.getKey() + ".", errors);
                }
            }
        }
    }

    public record ValidationResult(boolean valid, List<String> errors) {}
}
