package com.blueprintai.orchestrator.internal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class GenerationStartedListener {

    private static final Logger log = LoggerFactory.getLogger(GenerationStartedListener.class);

    private final ArchitectureGenerationRunner generationRunner;

    public GenerationStartedListener(ArchitectureGenerationRunner generationRunner) {
        this.generationRunner = generationRunner;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onGenerationStarted(GenerationStartedEvent event) {
        log.info("Starting async architecture generation for {}", event.generationId());
        generationRunner.runGeneration(event.generationId(), event.useCache());
    }
}
