package com.blueprintai.project.internal;

import com.blueprintai.project.api.ProjectService;
import org.springframework.stereotype.Service;

@Service
public class ProjectServiceImpl implements ProjectService {

    private static final String MODULE_NAME = "project";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
