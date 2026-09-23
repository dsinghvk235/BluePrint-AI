package com.blueprintai.diagram.internal.repository;

import com.blueprintai.diagram.internal.entity.Diagram;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DiagramRepository extends JpaRepository<Diagram, UUID> {

    Optional<Diagram> findByProjectId(UUID projectId);

    @Query(
            value =
                    """
            SELECT d.id, d.project_id, p.name, d.canvas_data
            FROM diagrams d
            INNER JOIN projects p ON p.id = d.project_id
            WHERE p.owner_id = :ownerId
              AND d.canvas_data::text ILIKE :pattern
            LIMIT 50
            """,
            nativeQuery = true)
    List<Object[]> findDiagramRowsForSearch(@Param("ownerId") UUID ownerId, @Param("pattern") String pattern);
}
