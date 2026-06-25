package com.blueprintai.learning.internal;

import com.blueprintai.learning.api.LearningEngineService;
import org.springframework.stereotype.Service;

@Service
public class LearningEngineServiceImpl implements LearningEngineService {

    private static final String MODULE_NAME = "learning-engine";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
