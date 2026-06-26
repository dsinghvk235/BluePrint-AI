package com.blueprintai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = "com.blueprintai")
@ConfigurationPropertiesScan(basePackages = "com.blueprintai")
@EnableCaching
@EnableRetry
@EnableAsync
public class BlueprintAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlueprintAiApplication.class, args);
    }
}
