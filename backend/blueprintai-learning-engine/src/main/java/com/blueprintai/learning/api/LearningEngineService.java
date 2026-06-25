package com.blueprintai.learning.api;

/** learning-engine module public contract. */
public interface LearningEngineService {

    String getModuleName();

    boolean isReady();
}
