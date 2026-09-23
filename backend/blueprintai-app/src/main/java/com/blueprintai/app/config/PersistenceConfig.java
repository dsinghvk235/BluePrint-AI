package com.blueprintai.app.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Central JPA configuration for the modular monolith.
 * Module-level {@code @EnableJpaRepositories} disables Spring Boot auto-config;
 * all entity and repository packages must be listed here.
 */
@Configuration
@EntityScan(
        basePackages = {
            "com.blueprintai.auth.internal.entity",
            "com.blueprintai.project.internal.entity",
            "com.blueprintai.diagram.internal.entity",
            "com.blueprintai.orchestrator.internal.entity",
            "com.blueprintai.aigateway.internal.logging",
            "com.blueprintai.search.internal.entity",
            "com.blueprintai.export.internal.entity",
            "com.blueprintai.review.internal.entity",
        })
@EnableJpaRepositories(
        basePackages = {
            "com.blueprintai.auth.internal.repository",
            "com.blueprintai.project.internal.repository",
            "com.blueprintai.diagram.internal.repository",
            "com.blueprintai.orchestrator.internal.repository",
            "com.blueprintai.aigateway.internal.logging",
            "com.blueprintai.search.internal.repository",
            "com.blueprintai.export.internal.repository",
            "com.blueprintai.review.internal.repository",
        })
public class PersistenceConfig {}
