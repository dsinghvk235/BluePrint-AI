package com.blueprintai.project.internal;

import com.blueprintai.project.api.ProjectStatus;
import com.blueprintai.project.internal.entity.Project;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

final class ProjectSpecifications {

    private ProjectSpecifications() {}

    static Specification<Project> ownedBy(UUID ownerId) {
        return (root, query, cb) -> cb.equal(root.get("ownerId"), ownerId);
    }

    static Specification<Project> search(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String pattern = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("description")), pattern),
                cb.like(cb.lower(root.get("systemType")), pattern));
    }

    static Specification<Project> withStatus(ProjectStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    static Specification<Project> withFavorite(Boolean favorite) {
        if (favorite == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("favorite"), favorite);
    }

    static Specification<Project> withArchived(Boolean archived) {
        if (archived == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("archived"), archived);
    }

    static Specification<Project> combine(UUID ownerId, String search, ProjectStatus status, Boolean favorite, Boolean archived) {
        Specification<Project> spec = ownedBy(ownerId);
        Specification<Project> searchSpec = search(search);
        if (searchSpec != null) {
            spec = spec.and(searchSpec);
        }
        Specification<Project> statusSpec = withStatus(status);
        if (statusSpec != null) {
            spec = spec.and(statusSpec);
        }
        Specification<Project> favoriteSpec = withFavorite(favorite);
        if (favoriteSpec != null) {
            spec = spec.and(favoriteSpec);
        }
        Specification<Project> archivedSpec = withArchived(archived);
        if (archivedSpec != null) {
            spec = spec.and(archivedSpec);
        }
        return spec;
    }
}
