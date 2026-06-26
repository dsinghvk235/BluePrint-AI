package com.blueprintai.orchestrator.internal.generator;

import com.blueprintai.aigateway.api.AiGatewayService;
import com.blueprintai.orchestrator.api.ArchitectureSection;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

@Component
class RequirementsGenerator extends ArchitectureGenerator {

    public RequirementsGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.REQUIREMENTS;
    }

    @Override
    public String promptId() {
        return "requirements";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "requirements-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("title").add("summary");
        return schema;
    }
}

@Component
class FunctionalRequirementsGenerator extends ArchitectureGenerator {

    FunctionalRequirementsGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.FUNCTIONAL_REQUIREMENTS;
    }

    @Override
    public String promptId() {
        return "functional-requirements";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "functional-requirements-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("functionalRequirements");
        return schema;
    }
}

@Component
class NonFunctionalRequirementsGenerator extends ArchitectureGenerator {

    NonFunctionalRequirementsGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.NON_FUNCTIONAL_REQUIREMENTS;
    }

    @Override
    public String promptId() {
        return "non-functional-requirements";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "non-functional-requirements-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("nonFunctionalRequirements");
        return schema;
    }
}

@Component
class AssumptionsGenerator extends ArchitectureGenerator {

    AssumptionsGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.ASSUMPTIONS;
    }

    @Override
    public String promptId() {
        return "assumptions";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "assumptions-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("assumptions");
        return schema;
    }
}

@Component
class HighLevelDesignGenerator extends ArchitectureGenerator {

    HighLevelDesignGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.HIGH_LEVEL_DESIGN;
    }

    @Override
    public String promptId() {
        return "high-level-design";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "high-level-design-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("services").add("connections");
        return schema;
    }
}

@Component
class LowLevelDesignGenerator extends ArchitectureGenerator {

    LowLevelDesignGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.LOW_LEVEL_DESIGN;
    }

    @Override
    public String promptId() {
        return "low-level-design";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "low-level-design-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("components");
        return schema;
    }
}

@Component
class DatabaseSchemaGenerator extends ArchitectureGenerator {

    DatabaseSchemaGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.DATABASE_SCHEMA;
    }

    @Override
    public String promptId() {
        return "database-schema";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "database-schema-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("tables").add("relationships");
        return schema;
    }
}

@Component
class ApiGenerator extends ArchitectureGenerator {

    ApiGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.APIS;
    }

    @Override
    public String promptId() {
        return "api-design";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "api-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("apis");
        return schema;
    }
}

@Component
class SecurityGenerator extends ArchitectureGenerator {

    SecurityGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.SECURITY;
    }

    @Override
    public String promptId() {
        return "security";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "security-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("controls");
        return schema;
    }
}

@Component
class DeploymentGenerator extends ArchitectureGenerator {

    DeploymentGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.DEPLOYMENT;
    }

    @Override
    public String promptId() {
        return "deployment";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "deployment-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("environments");
        return schema;
    }
}

@Component
class ScalingStrategyGenerator extends ArchitectureGenerator {

    ScalingStrategyGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.SCALING;
    }

    @Override
    public String promptId() {
        return "scaling-strategy";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "scaling-strategy-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("strategies");
        return schema;
    }
}

@Component
class DiagramJsonGenerator extends ArchitectureGenerator {

    DiagramJsonGenerator(AiGatewayService aiGateway, ObjectMapper objectMapper) {
        super(aiGateway, objectMapper);
    }

    @Override
    public ArchitectureSection section() {
        return ArchitectureSection.DIAGRAM;
    }

    @Override
    public String promptId() {
        return "diagram-json";
    }

    @Override
    public String promptVersion() {
        return "1.0.0";
    }

    @Override
    public String generatorName() {
        return "diagram-json-generator";
    }

    @Override
    protected JsonNode schema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.putArray("required").add("nodes").add("connections");
        return schema;
    }
}
