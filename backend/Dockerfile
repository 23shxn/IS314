# Simple Spring Boot application Dockerfile
FROM maven:3.9.4-eclipse-temurin-17
WORKDIR /app
# Copy the built JAR from the build stage
COPY . .
EXPOSE 8080
# Use environment variables that match application.properties
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5433/postgres
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=123456789
ENV SERVER_PORT=8080
ENTRYPOINT ["java", "-jar", "target/backend-1.0-SNAPSHOT.jar"]


