package com.ticketingSystem.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
        scanBasePackages = {
            "com.ticketingSystem.api",
            "com.ticketingSystem.calendar",
            "com.ticketingSystem.notification"
        })
@ConfigurationPropertiesScan(basePackages = "com.ticketingSystem")
@EnableJpaRepositories(
        basePackages = {
            "com.ticketingSystem.api.repository",
            "com.ticketingSystem.calendar.repository",
            "com.ticketingSystem.notification.repository"
        })
@EntityScan(
        basePackages = {
            "com.ticketingSystem.api.models",
            "com.ticketingSystem.calendar.entity",
            "com.ticketingSystem.notification.models"
        })
@EnableScheduling
public class Main {

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}
