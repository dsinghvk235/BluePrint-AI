package com.blueprintai.diagram.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EntityScan(basePackages = "com.blueprintai.diagram.internal.entity")
@EnableJpaRepositories(basePackages = "com.blueprintai.diagram.internal.repository")
public class DiagramModuleConfig {}
