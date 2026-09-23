package com.blueprintai.search.internal;

import com.blueprintai.diagram.api.DiagramService;
import com.blueprintai.diagram.api.dto.DiagramComponentSearchHit;
import com.blueprintai.knowledge.api.KnowledgeService;
import com.blueprintai.knowledge.api.dto.KnowledgeConceptSummary;
import com.blueprintai.project.api.ProjectService;
import com.blueprintai.project.api.dto.ProjectQueryParams;
import com.blueprintai.project.api.dto.ProjectResponse;
import com.blueprintai.search.api.SearchService;
import com.blueprintai.search.api.dto.SearchCategory;
import com.blueprintai.search.api.dto.SearchHistoryItem;
import com.blueprintai.search.api.dto.SearchResultItem;
import com.blueprintai.search.api.dto.UnifiedSearchResponse;
import com.blueprintai.search.internal.entity.SearchHistoryEntry;
import com.blueprintai.search.internal.repository.SearchHistoryRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchServiceImpl implements SearchService {

    private static final String MODULE_NAME = "search";
    private static final int MAX_SIZE = 50;

    private final ProjectService projectService;
    private final KnowledgeService knowledgeService;
    private final DiagramService diagramService;
    private final SearchHistoryRepository searchHistoryRepository;

    public SearchServiceImpl(
            ProjectService projectService,
            KnowledgeService knowledgeService,
            DiagramService diagramService,
            SearchHistoryRepository searchHistoryRepository) {
        this.projectService = projectService;
        this.knowledgeService = knowledgeService;
        this.diagramService = diagramService;
        this.searchHistoryRepository = searchHistoryRepository;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return projectService.isReady() && knowledgeService.isReady() && diagramService.isReady();
    }

    @Override
    @Cacheable(cacheNames = "unifiedSearch", key = "#userId + ':' + #query + ':' + #page + ':' + #size")
    @Transactional(readOnly = true)
    public UnifiedSearchResponse search(String query, UUID userId, int page, int size) {
        long started = System.currentTimeMillis();
        String trimmed = query != null ? query.trim() : "";
        int safeSize = Math.min(Math.max(size, 1), MAX_SIZE);
        int safePage = Math.max(page, 0);

        if (trimmed.isEmpty()) {
            List<SearchResultItem> recent = projectService.getRecentProjects(8, userId).stream()
                    .map(p -> new SearchResultItem(
                            p.id().toString(),
                            SearchCategory.RECENT_PROJECT,
                            p.name(),
                            "Recently opened",
                            p.description(),
                            "/workspace/" + p.id(),
                            10,
                            List.of(),
                            java.util.Map.of("lastOpened", String.valueOf(p.lastOpened()))))
                    .toList();
            return new UnifiedSearchResponse("", recent, recent.size(), 0, safeSize, System.currentTimeMillis() - started);
        }

        List<SearchResultItem> merged = new ArrayList<>();
        merged.addAll(searchProjects(trimmed, userId));
        merged.addAll(searchComponents(trimmed, userId));
        merged.addAll(searchKnowledge(trimmed));
        merged.addAll(TemplateCatalog.search(trimmed));

        merged.sort(Comparator.comparingDouble(SearchResultItem::score).reversed());

        int total = merged.size();
        int from = Math.min(safePage * safeSize, total);
        int to = Math.min(from + safeSize, total);
        List<SearchResultItem> pageItems = merged.subList(from, to);

        return new UnifiedSearchResponse(
                trimmed, pageItems, total, safePage, safeSize, System.currentTimeMillis() - started);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchHistoryItem> getRecentSearches(UUID userId, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        return searchHistoryRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, safeLimit))
                .stream()
                .map(e -> new SearchHistoryItem(e.getId(), e.getQuery(), e.getResultCount(), e.getCreatedAt()))
                .toList();
    }

    @Override
    @Transactional
    public void recordSearch(UUID userId, String query, int resultCount) {
        if (query == null || query.isBlank()) {
            return;
        }
        SearchHistoryEntry entry = new SearchHistoryEntry();
        entry.setUserId(userId);
        entry.setQuery(query.trim());
        entry.setResultCount(resultCount);
        searchHistoryRepository.save(entry);
    }

    @Override
    @Transactional
    public void clearSearchHistory(UUID userId) {
        searchHistoryRepository.deleteByUserId(userId);
    }

    private List<SearchResultItem> searchProjects(String query, UUID userId) {
        ProjectQueryParams params = new ProjectQueryParams(query, null, null, false, "updatedAt", "desc", 0, 15);
        return projectService.listProjects(params, userId).items().stream()
                .map(p -> toProjectHit(p, query))
                .filter(item -> item.score() > 0)
                .toList();
    }

    private SearchResultItem toProjectHit(ProjectResponse project, String query) {
        double score = Math.max(
                SearchHighlighter.scoreText(project.name(), query),
                Math.max(
                        SearchHighlighter.scoreText(project.description(), query),
                        SearchHighlighter.scoreText(project.systemType(), query)));
        for (String tag : project.tags()) {
            score = Math.max(score, SearchHighlighter.scoreText(tag, query));
        }
        if (project.pinned()) {
            score += 0.5;
        }
        if (project.favorite()) {
            score += 0.25;
        }
        return SearchResultItem.project(
                project.id(),
                project.name(),
                project.systemType() != null ? project.systemType() : "Project",
                score,
                SearchHighlighter.highlight(project.name(), query));
    }

    private List<SearchResultItem> searchComponents(String query, UUID userId) {
        return diagramService.searchComponents(userId, query, 15).stream()
                .map(hit -> toComponentHit(hit, query))
                .toList();
    }

    private SearchResultItem toComponentHit(DiagramComponentSearchHit hit, String query) {
        double score = Math.max(
                SearchHighlighter.scoreText(hit.label(), query),
                Math.max(
                        SearchHighlighter.scoreText(hit.nodeType(), query),
                        SearchHighlighter.scoreText(hit.technology(), query)));
        return new SearchResultItem(
                hit.projectId() + ":" + hit.nodeId(),
                SearchCategory.COMPONENT,
                hit.label(),
                hit.projectName(),
                hit.technology(),
                "/workspace/" + hit.projectId() + "?node=" + hit.nodeId(),
                score,
                SearchHighlighter.highlight(hit.label(), query),
                java.util.Map.of(
                        "projectId", hit.projectId().toString(),
                        "nodeId", hit.nodeId(),
                        "nodeType", hit.nodeType() != null ? hit.nodeType() : ""));
    }

    private List<SearchResultItem> searchKnowledge(String query) {
        return knowledgeService.searchConcepts(query).stream()
                .map(concept -> toKnowledgeHit(concept, query))
                .toList();
    }

    private SearchResultItem toKnowledgeHit(KnowledgeConceptSummary concept, String query) {
        double score = Math.max(
                SearchHighlighter.scoreText(concept.name(), query),
                Math.max(
                        SearchHighlighter.scoreText(concept.category(), query),
                        SearchHighlighter.scoreText(concept.overview(), query)));
        return new SearchResultItem(
                "knowledge:" + concept.id(),
                SearchCategory.KNOWLEDGE,
                concept.name(),
                concept.category(),
                concept.overview(),
                "/dashboard?concept=" + concept.id(),
                score,
                SearchHighlighter.highlight(concept.name(), query),
                java.util.Map.of("conceptId", concept.id()));
    }
}
