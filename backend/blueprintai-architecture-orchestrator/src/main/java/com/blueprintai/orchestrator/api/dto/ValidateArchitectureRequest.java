package com.blueprintai.orchestrator.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record ValidateArchitectureRequest(@NotNull ArchitectureModel architecture) {}
