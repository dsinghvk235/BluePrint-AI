package com.blueprintai.diagram.api;

import com.blueprintai.diagram.api.dto.DiagramComponentSearchHit;
import com.blueprintai.diagram.api.dto.DiagramResponse;
import com.blueprintai.diagram.api.dto.SaveDiagramRequest;
import java.util.List;
import java.util.UUID;

public interface DiagramService {

    String getModuleName();

    boolean isReady();

    DiagramResponse getDiagramByProject(UUID projectId, UUID ownerId);

    DiagramResponse saveDiagram(UUID projectId, SaveDiagramRequest request, UUID ownerId);

    void copyDiagramToProject(UUID sourceProjectId, UUID targetProjectId, UUID ownerId);

    List<DiagramComponentSearchHit> searchComponents(UUID ownerId, String query, int limit);
}
