package com.blueprintai.aigateway.internal.prompt;

import com.blueprintai.aigateway.api.AiTaskType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

/** Centralized prompt management — no prompts in business logic. */
@Component
public class PromptManager {

    private static final Logger log = LoggerFactory.getLogger(PromptManager.class);
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([a-zA-Z0-9_]+)}}");

    private final Map<String, PromptTemplate> templates = new HashMap<>();
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    @PostConstruct
    public void loadPrompts() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:prompts/*.yaml");
        for (Resource resource : resources) {
            try (InputStream input = resource.getInputStream()) {
                PromptTemplate template = yamlMapper.readValue(input, PromptTemplate.class);
                String key = template.id() + ":" + template.version();
                templates.put(key, template);
                log.info("Loaded prompt template: {}", key);
            }
        }
    }

    public PromptTemplate getTemplate(String promptId, String version) {
        PromptTemplate template = templates.get(promptId + ":" + version);
        if (template == null) {
            throw new IllegalArgumentException("Prompt template not found: " + promptId + ":" + version);
        }
        return template;
    }

    public RenderedPrompt render(String promptId, String version, Map<String, String> variables) {
        PromptTemplate template = getTemplate(promptId, version);
        return new RenderedPrompt(
                template.id(),
                template.version(),
                template.taskType(),
                template.generatorName(),
                interpolate(template.systemPrompt(), variables),
                interpolate(template.userPrompt(), variables));
    }

    private String interpolate(String template, Map<String, String> variables) {
        if (template == null) {
            return "";
        }
        Matcher matcher = VARIABLE_PATTERN.matcher(template);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String varName = matcher.group(1);
            String value = variables.getOrDefault(varName, "");
            matcher.appendReplacement(result, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PromptTemplate(
            String id,
            String version,
            AiTaskType taskType,
            String generatorName,
            String systemPrompt,
            String userPrompt) {}

    public record RenderedPrompt(
            String promptId,
            String version,
            AiTaskType taskType,
            String generatorName,
            String systemPrompt,
            String userPrompt) {}
}
