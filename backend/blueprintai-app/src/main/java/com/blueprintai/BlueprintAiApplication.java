package com.blueprintai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication(scanBasePackages = "com.blueprintai")
@ConfigurationPropertiesScan(basePackages = "com.blueprintai")
@EnableCaching
@EnableRetry
public class BlueprintAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlueprintAiApplication.class, args);
    }
}
