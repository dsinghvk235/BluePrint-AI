package com.blueprintai.knowledge.api;

import com.blueprintai.knowledge.api.dto.KnowledgeConcept;
import com.blueprintai.knowledge.api.dto.KnowledgeConceptSummary;
import java.util.List;
import java.util.Optional;

/** Engineering knowledge repository — static corpus, no AI dependency. */
public interface KnowledgeService {

    String getModuleName();

    boolean isReady();

    List<KnowledgeConceptSummary> listConcepts();

    List<KnowledgeConceptSummary> listConceptsByCategory(String category);

    Optional<KnowledgeConcept> getConcept(String conceptId);

    Optional<KnowledgeConcept> resolveConcept(String technology, String nodeCategory);

    List<KnowledgeConceptSummary> searchConcepts(String query);

    List<KnowledgeConceptSummary> getRelatedConcepts(String conceptId);
}
