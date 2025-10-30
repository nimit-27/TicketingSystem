# syntax=docker/dockerfile:1.7

FROM gradle:8.10.2-jdk17 AS builder

WORKDIR /home/gradle/project

COPY gradlew gradlew
COPY gradlew.bat gradlew.bat
COPY settings.gradle build.gradle ./
COPY gradle gradle
COPY src src
RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=builder /home/gradle/project/build/libs/*.jar app.jar
RUN mkdir -p /app/uploads
VOLUME ["/app/uploads"]
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]
