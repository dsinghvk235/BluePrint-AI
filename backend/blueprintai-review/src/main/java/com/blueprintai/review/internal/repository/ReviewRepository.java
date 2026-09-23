package com.blueprintai.review.internal.repository;

import com.blueprintai.review.internal.entity.Review;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Query(
            """
            SELECT AVG(r.rating), COUNT(r), SUM(CASE WHEN r.helpful = true THEN 1 ELSE 0 END),
                   SUM(CASE WHEN r.helpful = false THEN 1 ELSE 0 END)
            FROM Review r
            WHERE r.targetType = :targetType AND r.targetId = :targetId
            """)
    List<Object[]> summarizeByTarget(@Param("targetType") String targetType, @Param("targetId") UUID targetId);

    @Query(
            """
            SELECT AVG(r.rating), COUNT(r), SUM(CASE WHEN r.helpful = true THEN 1 ELSE 0 END),
                   SUM(CASE WHEN r.helpful = false THEN 1 ELSE 0 END)
            FROM Review r
            WHERE r.projectId = :projectId
            """)
    List<Object[]> summarizeByProject(@Param("projectId") UUID projectId);
}
