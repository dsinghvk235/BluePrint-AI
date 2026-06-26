package com.blueprintai.aigateway.internal.logging;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromptLogRepository extends JpaRepository<PromptLog, UUID> {}
