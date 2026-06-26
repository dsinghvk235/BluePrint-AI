package com.blueprintai.knowledge.internal;

import com.blueprintai.knowledge.api.KnowledgeService;
import com.blueprintai.knowledge.api.dto.KnowledgeConcept;
import com.blueprintai.knowledge.api.dto.KnowledgeConceptSummary;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeServiceImpl implements KnowledgeService {

    private static final String MODULE_NAME = "knowledge";
    private static final Set<String> CATEGORY_ALIASES = Set.of(
            "service", "database", "cache", "queue", "client", "api-gateway",
            "microservice", "cdn", "storage", "load-balancer", "external-api",
            "authentication", "worker", "monitoring", "custom");

    private final KnowledgeRepository repository;

    public KnowledgeServiceImpl(KnowledgeRepository repository) {
        this.repository = repository;
    }

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return !repository.allConcepts().isEmpty();
    }

    @Override
    public List<KnowledgeConceptSummary> listConcepts() {
        return repository.allConcepts().stream().map(this::toSummary).toList();
    }

    @Override
    public List<KnowledgeConceptSummary> listConceptsByCategory(String category) {
        String normalized = category == null ? "" : category.toLowerCase(Locale.ROOT);
        return repository.allConcepts().stream()
                .filter(c -> normalized.equals(c.category()))
                .map(this::toSummary)
                .toList();
    }

    @Override
    public Optional<KnowledgeConcept> getConcept(String conceptId) {
        return repository.findById(conceptId);
    }

    @Override
    public Optional<KnowledgeConcept> resolveConcept(String technology, String nodeCategory) {
        if (technology != null && !technology.isBlank()) {
            Optional<KnowledgeConcept> byTech = repository.findByAlias(technology);
            if (byTech.isPresent()) {
                return byTech;
            }
            for (String token : technology.split("[,\\s/]+")) {
                Optional<KnowledgeConcept> match = repository.findByAlias(token);
                if (match.isPresent()) {
                    return match;
                }
            }
        }
        if (nodeCategory != null && !nodeCategory.isBlank()) {
            Optional<KnowledgeConcept> byCategory = repository.findByAlias(nodeCategory);
            if (byCategory.isPresent()) {
                return byCategory;
            }
            if (CATEGORY_ALIASES.contains(nodeCategory.toLowerCase(Locale.ROOT))) {
                return repository.findByAlias(mapCategoryToConcept(nodeCategory));
            }
        }
        return Optional.empty();
    }

    @Override
    public List<KnowledgeConceptSummary> searchConcepts(String query) {
        if (query == null || query.isBlank()) {
            return listConcepts();
        }
        String q = query.toLowerCase(Locale.ROOT);
        return repository.allConcepts().stream()
                .filter(c -> matches(c, q))
                .sorted(Comparator.comparing(KnowledgeConcept::name))
                .map(this::toSummary)
                .toList();
    }

    @Override
    public List<KnowledgeConceptSummary> getRelatedConcepts(String conceptId) {
        return repository.findById(conceptId)
                .map(concept -> {
                    List<KnowledgeConceptSummary> related = new ArrayList<>();
                    if (concept.relatedConcepts() != null) {
                        for (String relatedId : concept.relatedConcepts()) {
                            repository.findById(relatedId).map(this::toSummary).ifPresent(related::add);
                        }
                    }
                    return related;
                })
                .orElse(List.of());
    }

    private boolean matches(KnowledgeConcept concept, String query) {
        if (concept.name().toLowerCase(Locale.ROOT).contains(query)) {
            return true;
        }
        if (concept.category() != null && concept.category().toLowerCase(Locale.ROOT).contains(query)) {
            return true;
        }
        if (concept.overview() != null && concept.overview().toLowerCase(Locale.ROOT).contains(query)) {
            return true;
        }
        if (concept.aliases() != null) {
            for (String alias : concept.aliases()) {
                if (alias.toLowerCase(Locale.ROOT).contains(query)) {
                    return true;
                }
            }
        }
        return false;
    }

    private KnowledgeConceptSummary toSummary(KnowledgeConcept concept) {
        return new KnowledgeConceptSummary(
                concept.id(),
                concept.name(),
                concept.category(),
                concept.overview(),
                concept.relatedConcepts() == null ? List.of() : List.copyOf(concept.relatedConcepts()));
    }

    private String mapCategoryToConcept(String nodeCategory) {
        return switch (nodeCategory.toLowerCase(Locale.ROOT)) {
            case "database" -> "databases";
            case "cache" -> "caching";
            case "queue" -> "queues";
            case "load-balancer" -> "load-balancers";
            case "api-gateway" -> "api-gateway";
            case "microservice", "service" -> "microservices";
            case "authentication" -> "oauth";
            case "cdn" -> "cdn";
            case "worker" -> "event-driven-architecture";
            case "monitoring" -> "circuit-breaker";
            default -> nodeCategory;
        };
    }
}
