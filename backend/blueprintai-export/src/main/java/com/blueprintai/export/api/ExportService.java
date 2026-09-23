package com.blueprintai.export.api;

import com.blueprintai.export.api.dto.ExportResult;
import java.util.UUID;

/** Professional export engine for architecture diagrams and metadata. */
public interface ExportService {

    String getModuleName();

    boolean isReady();

    ExportResult exportProject(UUID projectId, ExportFormat format, UUID ownerId);
}
