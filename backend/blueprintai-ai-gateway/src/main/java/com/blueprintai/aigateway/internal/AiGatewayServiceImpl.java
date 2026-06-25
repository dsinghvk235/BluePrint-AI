package com.blueprintai.aigateway.internal;

import com.blueprintai.aigateway.api.AiGatewayService;
import org.springframework.stereotype.Service;

@Service
public class AiGatewayServiceImpl implements AiGatewayService {

    private static final String MODULE_NAME = "ai-gateway";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
