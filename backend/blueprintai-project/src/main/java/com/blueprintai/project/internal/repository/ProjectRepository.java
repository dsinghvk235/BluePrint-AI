package com.blueprintai.project.internal.repository;

import com.blueprintai.project.internal.entity.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {

    Optional<Project> findByIdAndOwnerId(UUID id, UUID ownerId);

    @Query("SELECT p FROM Project p WHERE p.ownerId = :ownerId AND p.archived = false ORDER BY p.lastOpened DESC NULLS LAST")
    List<Project> findRecentByOwnerId(UUID ownerId, Pageable pageable);

    Page<Project> findByOwnerId(UUID ownerId, Pageable pageable);
}
