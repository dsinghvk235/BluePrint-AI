package com.blueprintai.diagram.internal.repository;

import com.blueprintai.diagram.internal.entity.Diagram;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagramRepository extends JpaRepository<Diagram, UUID> {

    Optional<Diagram> findByProjectId(UUID projectId);
}
