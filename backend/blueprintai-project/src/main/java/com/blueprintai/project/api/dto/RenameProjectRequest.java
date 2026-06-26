package com.blueprintai.project.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RenameProjectRequest(@NotBlank @Size(min = 1, max = 200) String name) {}
