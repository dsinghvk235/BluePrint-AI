package com.blueprintai.search.internal.repository;

import com.blueprintai.search.internal.entity.SearchHistoryEntry;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface SearchHistoryRepository extends JpaRepository<SearchHistoryEntry, UUID> {

    List<SearchHistoryEntry> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM SearchHistoryEntry e WHERE e.userId = :userId")
    void deleteByUserId(UUID userId);
}
