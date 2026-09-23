package com.blueprintai.export.api.dto;

import com.blueprintai.export.api.ExportFormat;

public record ExportResult(
        ExportFormat format,
        String fileName,
        String mimeType,
        byte[] content,
        long durationMs,
        long fileSizeBytes) {}
