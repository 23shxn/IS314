# Stage 1: Build the Spring Boot app using Maven
FROM maven:3.9.4-eclipse-temurin-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the built JAR
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/target/backend.jar app.jar
EXPOSE 8080

# Use environment variables that match application.properties
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5433/postgres
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=123456789
ENV SERVER_PORT=8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
