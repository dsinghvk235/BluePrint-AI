package com.blueprintai.orchestrator.api;

/** architecture-orchestrator module public contract. */
public interface ArchitectureOrchestratorService {

    String getModuleName();

    boolean isReady();
}
