package com.blueprintai.diagram.internal;

import com.blueprintai.diagram.api.DiagramEngineService;
import org.springframework.stereotype.Service;

@Service
public class DiagramEngineServiceImpl implements DiagramEngineService {

    private static final String MODULE_NAME = "diagram-engine";

    private final DiagramServiceImpl diagramService;

    public DiagramEngineServiceImpl(DiagramServiceImpl diagramService) {
        this.diagramService = diagramService;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return diagramService.isReady();
    }
}
