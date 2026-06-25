package com.blueprintai.knowledge.api;

/** knowledge module public contract. */
public interface KnowledgeService {

    String getModuleName();

    boolean isReady();
}
