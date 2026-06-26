package com.blueprintai.orchestrator.internal.generator;

import com.blueprintai.orchestrator.api.ArchitectureSection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class GeneratorLookup {

    private final Map<ArchitectureSection, ArchitectureGenerator> generators;

    public GeneratorLookup(List<ArchitectureGenerator> generatorList) {
        this.generators = new EnumMap<>(ArchitectureSection.class);
        for (ArchitectureGenerator generator : generatorList) {
            generators.put(generator.section(), generator);
        }
    }

    public ArchitectureGenerator get(ArchitectureSection section) {
        ArchitectureGenerator generator = generators.get(section);
        if (generator == null) {
            throw new IllegalArgumentException("No generator for section: " + section);
        }
        return generator;
    }

    public List<ArchitectureGenerator> allInOrder() {
        return List.of(
                generators.get(ArchitectureSection.REQUIREMENTS),
                generators.get(ArchitectureSection.FUNCTIONAL_REQUIREMENTS),
                generators.get(ArchitectureSection.NON_FUNCTIONAL_REQUIREMENTS),
                generators.get(ArchitectureSection.ASSUMPTIONS),
                generators.get(ArchitectureSection.HIGH_LEVEL_DESIGN),
                generators.get(ArchitectureSection.LOW_LEVEL_DESIGN),
                generators.get(ArchitectureSection.DATABASE_SCHEMA),
                generators.get(ArchitectureSection.APIS),
                generators.get(ArchitectureSection.SECURITY),
                generators.get(ArchitectureSection.DEPLOYMENT),
                generators.get(ArchitectureSection.SCALING),
                generators.get(ArchitectureSection.DIAGRAM));
    }
}
