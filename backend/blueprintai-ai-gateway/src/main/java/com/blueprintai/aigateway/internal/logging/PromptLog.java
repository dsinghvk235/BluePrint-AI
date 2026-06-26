package com.blueprintai.aigateway.internal.logging;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "prompt_logs")
public class PromptLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "correlation_id", nullable = false)
    private UUID correlationId;

    @Column(name = "prompt_id", nullable = false, length = 100)
    private String promptId;

    @Column(name = "prompt_version", nullable = false, length = 20)
    private String promptVersion;

    @Column(name = "generator_name", nullable = false, length = 100)
    private String generatorName;

    @Column(name = "task_type", nullable = false, length = 50)
    private String taskType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private com.fasterxml.jackson.databind.JsonNode variables;

    @Column(name = "rendered_system_prompt")
    private String renderedSystemPrompt;

    @Column(name = "rendered_user_prompt")
    private String renderedUserPrompt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(UUID correlationId) {
        this.correlationId = correlationId;
    }

    public String getPromptId() {
        return promptId;
    }

    public void setPromptId(String promptId) {
        this.promptId = promptId;
    }

    public String getPromptVersion() {
        return promptVersion;
    }

    public void setPromptVersion(String promptVersion) {
        this.promptVersion = promptVersion;
    }

    public String getGeneratorName() {
        return generatorName;
    }

    public void setGeneratorName(String generatorName) {
        this.generatorName = generatorName;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public com.fasterxml.jackson.databind.JsonNode getVariables() {
        return variables;
    }

    public void setVariables(com.fasterxml.jackson.databind.JsonNode variables) {
        this.variables = variables;
    }

    public String getRenderedSystemPrompt() {
        return renderedSystemPrompt;
    }

    public void setRenderedSystemPrompt(String renderedSystemPrompt) {
        this.renderedSystemPrompt = renderedSystemPrompt;
    }

    public String getRenderedUserPrompt() {
        return renderedUserPrompt;
    }

    public void setRenderedUserPrompt(String renderedUserPrompt) {
        this.renderedUserPrompt = renderedUserPrompt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
