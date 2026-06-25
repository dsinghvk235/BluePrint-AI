package com.blueprintai.aigateway.api;

/** ai-gateway module public contract. */
public interface AiGatewayService {

    String getModuleName();

    boolean isReady();
}
