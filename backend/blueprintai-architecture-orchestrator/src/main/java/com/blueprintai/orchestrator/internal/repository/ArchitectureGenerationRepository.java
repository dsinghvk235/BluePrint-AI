package com.blueprintai.orchestrator.internal.repository;

import com.blueprintai.orchestrator.internal.entity.ArchitectureGeneration;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArchitectureGenerationRepository extends JpaRepository<ArchitectureGeneration, UUID> {}
