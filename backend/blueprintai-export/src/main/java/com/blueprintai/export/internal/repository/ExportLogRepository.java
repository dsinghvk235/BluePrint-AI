package com.blueprintai.export.internal.repository;

import com.blueprintai.export.internal.entity.ExportLog;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportLogRepository extends JpaRepository<ExportLog, UUID> {}
