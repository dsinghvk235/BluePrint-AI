package com.blueprintai.orchestrator.internal.pipeline;

/** A single step in the architecture generation pipeline (AI or deterministic). */
public interface GenerationPipelineStep {

    String stepName();

    String promptVersion();

    void execute(GenerationPipelineContext context) throws Exception;
}
