package com.blueprintai.diagram.api;

/** diagram-engine module public contract. */
public interface DiagramEngineService {

    String getModuleName();

    boolean isReady();
}
