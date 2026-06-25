package com.blueprintai.knowledge.internal;

import com.blueprintai.knowledge.api.KnowledgeService;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeServiceImpl implements KnowledgeService {

    private static final String MODULE_NAME = "knowledge";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
