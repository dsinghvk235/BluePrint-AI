# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY blueprintai-common blueprintai-common
COPY blueprintai-auth blueprintai-auth
COPY blueprintai-project blueprintai-project
COPY blueprintai-ai-gateway blueprintai-ai-gateway
COPY blueprintai-architecture-orchestrator blueprintai-architecture-orchestrator
COPY blueprintai-diagram-engine blueprintai-diagram-engine
COPY blueprintai-learning-engine blueprintai-learning-engine
COPY blueprintai-knowledge blueprintai-knowledge
COPY blueprintai-search blueprintai-search
COPY blueprintai-export blueprintai-export
COPY blueprintai-review blueprintai-review
COPY blueprintai-app blueprintai-app
RUN chmod +x gradlew && ./gradlew :blueprintai-app:bootJar -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/blueprintai-app/build/libs/blueprintai.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
