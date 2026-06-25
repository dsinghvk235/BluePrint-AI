package com.blueprintai.export.internal;

import com.blueprintai.export.api.ExportService;
import org.springframework.stereotype.Service;

@Service
public class ExportServiceImpl implements ExportService {

    private static final String MODULE_NAME = "export";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
