package com.ticketingSystem.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.ticketingSystem")
@ConfigurationPropertiesScan(basePackages = "com.ticketingSystem")
@EnableJpaRepositories(basePackages = {"com.ticketingSystem.notification.repository", "com.ticketingSystem.api.repository"})
@EntityScan(basePackages = {"com.ticketingSystem.notification.models", "com.ticketingSystem.api.models"})
@EnableScheduling
public class Main {

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}
