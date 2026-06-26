package com.blueprintai.orchestrator.api.dto;

import java.util.List;

public record ValidateArchitectureResponse(boolean valid, List<String> errors, List<String> warnings) {}
