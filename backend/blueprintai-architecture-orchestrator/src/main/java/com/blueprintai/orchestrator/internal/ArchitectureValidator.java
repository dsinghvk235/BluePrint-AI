package com.blueprintai.orchestrator.internal;

import com.blueprintai.orchestrator.api.dto.ArchitectureModel;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureRequest;
import com.blueprintai.orchestrator.api.dto.ValidateArchitectureResponse;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ArchitectureValidator {

    public ValidateArchitectureResponse validate(ValidateArchitectureRequest request) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        ArchitectureModel model = request.architecture();

        if (model.requirements() == null) {
            errors.add("Missing requirements section");
        } else {
            if (model.requirements().title() == null || model.requirements().title().isBlank()) {
                errors.add("Requirements title is required");
            }
        }
        if (model.functionalRequirements() == null || model.functionalRequirements().isEmpty()) {
            warnings.add("No functional requirements defined");
        }
        if (model.highLevelDesign() == null) {
            errors.add("Missing high-level design");
        }
        if (model.databaseSchema() == null) {
            warnings.add("No database schema defined");
        }
        if (model.security() == null) {
            warnings.add("No security section defined");
        }
        if (model.diagram() == null) {
            warnings.add("No diagram generated");
        }

        return new ValidateArchitectureResponse(errors.isEmpty(), errors, warnings);
    }
}
