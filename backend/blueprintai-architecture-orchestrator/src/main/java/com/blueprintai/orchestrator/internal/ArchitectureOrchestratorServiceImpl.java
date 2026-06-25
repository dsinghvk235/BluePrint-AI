package com.blueprintai.orchestrator.internal;

import com.blueprintai.orchestrator.api.ArchitectureOrchestratorService;
import org.springframework.stereotype.Service;

@Service
public class ArchitectureOrchestratorServiceImpl implements ArchitectureOrchestratorService {

    private static final String MODULE_NAME = "architecture-orchestrator";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
