package com.blueprintai.app.export;

import com.blueprintai.auth.api.CurrentUserProvider;
import com.blueprintai.export.api.ExportFormat;
import com.blueprintai.export.api.ExportService;
import com.blueprintai.export.api.dto.ExportResult;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/export")
public class ExportController {

    private final ExportService exportService;
    private final CurrentUserProvider currentUserProvider;

    public ExportController(ExportService exportService, CurrentUserProvider currentUserProvider) {
        this.exportService = exportService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public ResponseEntity<byte[]> export(
            @PathVariable UUID projectId, @RequestParam(defaultValue = "JSON") ExportFormat format) {
        ExportResult result =
                exportService.exportProject(projectId, format, currentUserProvider.getCurrentUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.mimeType()))
                .contentLength(result.content().length)
                .body(result.content());
    }
}
