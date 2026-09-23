package com.blueprintai.export.internal;

import com.blueprintai.common.exception.BusinessException;
import com.blueprintai.common.exception.ErrorCode;
import com.blueprintai.diagram.api.DiagramService;
import com.blueprintai.diagram.api.dto.DiagramResponse;
import com.blueprintai.export.api.ExportFormat;
import com.blueprintai.export.api.ExportService;
import com.blueprintai.export.api.dto.ExportResult;
import com.blueprintai.export.internal.entity.ExportLog;
import com.blueprintai.export.internal.repository.ExportLogRepository;
import com.blueprintai.project.api.ProjectService;
import com.blueprintai.project.api.dto.ProjectResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExportServiceImpl implements ExportService {

    private static final String MODULE_NAME = "export";

    private final ProjectService projectService;
    private final DiagramService diagramService;
    private final ExportLogRepository exportLogRepository;
    private final ObjectMapper objectMapper;

    public ExportServiceImpl(
            ProjectService projectService,
            DiagramService diagramService,
            ExportLogRepository exportLogRepository,
            ObjectMapper objectMapper) {
        this.projectService = projectService;
        this.diagramService = diagramService;
        this.exportLogRepository = exportLogRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return projectService.isReady() && diagramService.isReady();
    }

    @Override
    @Transactional
    public ExportResult exportProject(UUID projectId, ExportFormat format, UUID ownerId) {
        long started = System.currentTimeMillis();
        ProjectResponse project = projectService.getProject(projectId, ownerId);
        DiagramResponse diagram = diagramService.getDiagramByProject(projectId, ownerId);

        ExportResult result =
                switch (format) {
                    case JSON -> exportJson(project, diagram);
                    case MARKDOWN -> exportMarkdown(project, diagram);
                    case SVG -> exportSvg(project, diagram);
                    case PDF -> exportPdf(project, diagram);
                    case PNG -> exportPngPlaceholder(project);
                };

        long duration = System.currentTimeMillis() - started;
        logExport(ownerId, projectId, format, result.fileSizeBytes(), duration);
        projectService.recordExport(projectId, ownerId);

        return new ExportResult(
                format,
                result.fileName(),
                result.mimeType(),
                result.content(),
                duration,
                result.fileSizeBytes());
    }

    private void logExport(UUID userId, UUID projectId, ExportFormat format, long fileSize, long duration) {
        ExportLog log = new ExportLog();
        log.setUserId(userId);
        log.setProjectId(projectId);
        log.setFormat(format.name());
        log.setFileSizeBytes(fileSize);
        log.setDurationMs(duration);
        exportLogRepository.save(log);
    }

    private ExportResult exportJson(ProjectResponse project, DiagramResponse diagram) {
        try {
            var payload = objectMapper.createObjectNode();
            payload.put("projectId", project.id().toString());
            payload.put("projectName", project.name());
            payload.put("theme", project.theme());
            payload.put("version", project.currentVersion());
            payload.set("diagram", diagram.canvasData());
            byte[] bytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(payload);
            return new ExportResult(
                    ExportFormat.JSON,
                    slug(project.name()) + ".json",
                    "application/json",
                    bytes,
                    0,
                    bytes.length);
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "JSON export failed", ex);
        }
    }

    private ExportResult exportMarkdown(ProjectResponse project, DiagramResponse diagram) {
        StringBuilder md = new StringBuilder();
        md.append("# ").append(project.name()).append("\n\n");
        if (project.description() != null && !project.description().isBlank()) {
            md.append(project.description()).append("\n\n");
        }
        md.append("**System type:** ").append(nullSafe(project.systemType())).append("\n");
        md.append("**Theme:** ").append(nullSafe(project.theme())).append("\n");
        md.append("**Version:** ").append(project.currentVersion()).append("\n\n");
        md.append("## Architecture Components\n\n");

        JsonNode nodes = diagram.canvasData().path("nodes");
        if (nodes.isArray()) {
            for (JsonNode node : nodes) {
                JsonNode data = node.path("data");
                md.append("- **")
                        .append(data.path("label").asText("Component"))
                        .append("** (")
                        .append(data.path("category").asText("service"))
                        .append(")");
                String tech = data.path("technology").asText("");
                if (!tech.isBlank()) {
                    md.append(" — ").append(tech);
                }
                md.append("\n");
            }
        }

        md.append("\n## Connections\n\n");
        JsonNode edges = diagram.canvasData().path("edges");
        if (edges.isArray()) {
            for (JsonNode edge : edges) {
                md.append("- ")
                        .append(edge.path("source").asText())
                        .append(" → ")
                        .append(edge.path("target").asText());
                String label = edge.path("label").asText("");
                if (!label.isBlank()) {
                    md.append(" (").append(label).append(")");
                }
                md.append("\n");
            }
        }

        byte[] bytes = md.toString().getBytes(StandardCharsets.UTF_8);
        return new ExportResult(
                ExportFormat.MARKDOWN,
                slug(project.name()) + ".md",
                "text/markdown",
                bytes,
                0,
                bytes.length);
    }

    private ExportResult exportSvg(ProjectResponse project, DiagramResponse diagram) {
        JsonNode nodes = diagram.canvasData().path("nodes");
        JsonNode edges = diagram.canvasData().path("edges");
        String theme = project.theme() != null ? project.theme() : "light";
        boolean dark = "dark".equalsIgnoreCase(theme);
        String bg = dark ? "#0f172a" : "#ffffff";
        String stroke = dark ? "#64748b" : "#94a3b8";
        String fill = dark ? "#1e293b" : "#f8fafc";
        String text = dark ? "#f1f5f9" : "#0f172a";

        StringBuilder svg = new StringBuilder();
        svg.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"800\" viewBox=\"0 0 1200 800\">\n");
        svg.append("<rect width=\"100%\" height=\"100%\" fill=\"").append(bg).append("\"/>\n");
        svg.append("<text x=\"24\" y=\"32\" font-family=\"Inter, sans-serif\" font-size=\"18\" fill=\"")
                .append(text)
                .append("\">")
                .append(escapeXml(project.name()))
                .append("</text>\n");

        if (edges.isArray()) {
            for (JsonNode edge : edges) {
                JsonNode source = findNode(nodes, edge.path("source").asText());
                JsonNode target = findNode(nodes, edge.path("target").asText());
                if (source == null || target == null) {
                    continue;
                }
                double x1 = source.path("position").path("x").asDouble() + 100;
                double y1 = source.path("position").path("y").asDouble() + 30;
                double x2 = target.path("position").path("x").asDouble() + 100;
                double y2 = target.path("position").path("y").asDouble() + 30;
                svg.append("<line x1=\"")
                        .append(x1)
                        .append("\" y1=\"")
                        .append(y1)
                        .append("\" x2=\"")
                        .append(x2)
                        .append("\" y2=\"")
                        .append(y2)
                        .append("\" stroke=\"")
                        .append(stroke)
                        .append("\" stroke-width=\"2\"/>\n");
            }
        }

        if (nodes.isArray()) {
            for (JsonNode node : nodes) {
                double x = node.path("position").path("x").asDouble();
                double y = node.path("position").path("y").asDouble();
                String label = node.path("data").path("label").asText("Node");
                svg.append("<rect x=\"")
                        .append(x)
                        .append("\" y=\"")
                        .append(y)
                        .append("\" width=\"200\" height=\"60\" rx=\"8\" fill=\"")
                        .append(fill)
                        .append("\" stroke=\"")
                        .append(stroke)
                        .append("\"/>\n");
                svg.append("<text x=\"")
                        .append(x + 12)
                        .append("\" y=\"")
                        .append(y + 36)
                        .append("\" font-family=\"Inter, sans-serif\" font-size=\"13\" fill=\"")
                        .append(text)
                        .append("\">")
                        .append(escapeXml(label))
                        .append("</text>\n");
            }
        }

        svg.append("</svg>");
        byte[] bytes = svg.toString().getBytes(StandardCharsets.UTF_8);
        return new ExportResult(
                ExportFormat.SVG, slug(project.name()) + ".svg", "image/svg+xml", bytes, 0, bytes.length);
    }

    private ExportResult exportPdf(ProjectResponse project, DiagramResponse diagram) {
        ExportResult markdown = exportMarkdown(project, diagram);
        String content = new String(markdown.content(), StandardCharsets.UTF_8);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            document.add(new Paragraph(project.name(), titleFont));
            document.add(new Paragraph(" "));
            for (String line : content.split("\n")) {
                document.add(new Paragraph(line, bodyFont));
            }
            document.close();
            byte[] bytes = out.toByteArray();
            return new ExportResult(
                    ExportFormat.PDF, slug(project.name()) + ".pdf", "application/pdf", bytes, 0, bytes.length);
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "PDF export failed", ex);
        }
    }

    private ExportResult exportPngPlaceholder(ProjectResponse project) {
        String message =
                "PNG export is optimized on the client for pixel-perfect canvas rendering. Use the in-app export dialog.";
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        return new ExportResult(
                ExportFormat.PNG,
                slug(project.name()) + "-export-readme.txt",
                "text/plain",
                bytes,
                0,
                bytes.length);
    }

    private JsonNode findNode(JsonNode nodes, String id) {
        if (!nodes.isArray()) {
            return null;
        }
        for (JsonNode node : nodes) {
            if (id.equals(node.path("id").asText())) {
                return node;
            }
        }
        return null;
    }

    private String slug(String name) {
        return name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private String nullSafe(String value) {
        return value != null ? value : "—";
    }

    private String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
