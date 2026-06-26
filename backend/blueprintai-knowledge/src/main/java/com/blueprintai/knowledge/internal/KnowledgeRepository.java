package com.blueprintai.knowledge.internal;

import com.blueprintai.knowledge.api.dto.KnowledgeConcept;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Repository;

/** Loads knowledge concepts from classpath resources — add JSON files without code changes. */
@Repository
public class KnowledgeRepository {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeRepository.class);
    private static final String CATALOG_PATH = "classpath:knowledge/catalog.json";
    private static final String CONCEPTS_PATTERN = "classpath:knowledge/concepts/*.json";

    private final ObjectMapper objectMapper;
    private final Map<String, KnowledgeConcept> conceptsById = new LinkedHashMap<>();
    private final Map<String, String> aliasIndex = new LinkedHashMap<>();

    public KnowledgeRepository(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void loadConcepts() {
        loadCatalog();
        loadIndividualConceptFiles();
        buildAliasIndex();
        log.info("Knowledge repository loaded {} concepts", conceptsById.size());
    }

    public List<KnowledgeConcept> allConcepts() {
        return List.copyOf(conceptsById.values());
    }

    public Optional<KnowledgeConcept> findById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(conceptsById.get(id.toLowerCase(Locale.ROOT)));
    }

    public Optional<KnowledgeConcept> findByAlias(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        String key = token.toLowerCase(Locale.ROOT).trim();
        String conceptId = aliasIndex.get(key);
        return conceptId != null ? findById(conceptId) : Optional.empty();
    }

    private void loadCatalog() {
        try (InputStream stream = new PathMatchingResourcePatternResolver()
                .getResource(CATALOG_PATH)
                .getInputStream()) {
            CatalogFile catalog = objectMapper.readValue(stream, CatalogFile.class);
            if (catalog.concepts() != null) {
                for (KnowledgeConcept concept : catalog.concepts()) {
                    registerConcept(concept);
                }
            }
        } catch (IOException ex) {
            log.warn("Knowledge catalog not found or unreadable: {}", ex.getMessage());
        }
    }

    private void loadIndividualConceptFiles() {
        try {
            Resource[] resources = new PathMatchingResourcePatternResolver().getResources(CONCEPTS_PATTERN);
            for (Resource resource : resources) {
                try (InputStream stream = resource.getInputStream()) {
                    KnowledgeConcept concept = objectMapper.readValue(stream, KnowledgeConcept.class);
                    registerConcept(concept);
                } catch (IOException ex) {
                    log.warn("Failed to load knowledge concept from {}: {}", resource.getFilename(), ex.getMessage());
                }
            }
        } catch (IOException ex) {
            log.debug("No individual concept files found: {}", ex.getMessage());
        }
    }

    private void registerConcept(KnowledgeConcept concept) {
        if (concept == null || concept.id() == null) {
            return;
        }
        conceptsById.put(concept.id().toLowerCase(Locale.ROOT), concept);
    }

    private void buildAliasIndex() {
        aliasIndex.clear();
        for (KnowledgeConcept concept : conceptsById.values()) {
            aliasIndex.put(concept.id().toLowerCase(Locale.ROOT), concept.id().toLowerCase(Locale.ROOT));
            aliasIndex.put(normalize(concept.name()), concept.id().toLowerCase(Locale.ROOT));
            if (concept.aliases() != null) {
                for (String alias : concept.aliases()) {
                    aliasIndex.put(normalize(alias), concept.id().toLowerCase(Locale.ROOT));
                }
            }
            if (concept.category() != null) {
                aliasIndex.putIfAbsent(normalize(concept.category()), concept.id().toLowerCase(Locale.ROOT));
            }
        }
    }

    private static String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private record CatalogFile(String version, List<KnowledgeConcept> concepts) {}
}
