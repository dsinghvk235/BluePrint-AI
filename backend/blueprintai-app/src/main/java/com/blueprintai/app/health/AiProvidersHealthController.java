package com.blueprintai.app.health;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.aigateway.api.dto.ProviderHealthResponse;
import com.blueprintai.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public AI infrastructure health — no auth required so operators can verify provider
 * configuration before testing authenticated architecture APIs.
 */
@RestController
@RequestMapping("/api/v1/health")
public class AiProvidersHealthController {

    private final AiGatewayService aiGatewayService;

    public AiProvidersHealthController(AiGatewayService aiGatewayService) {
        this.aiGatewayService = aiGatewayService;
    }

    @GetMapping("/ai-providers")
    public ApiResponse<ProviderHealthResponse> aiProviders() {
        return ApiResponse.success(aiGatewayService.getProviderHealth());
    }
}
