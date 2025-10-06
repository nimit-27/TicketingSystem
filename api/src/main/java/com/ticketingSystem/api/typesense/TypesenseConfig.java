package com.ticketingSystem.api.typesense;

import org.springframework.context.annotation.Bean;
import org.typesense.api.Client;
import org.typesense.api.Configuration;
import org.typesense.resources.Node;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.List;

@org.springframework.context.annotation.Configuration
public class TypesenseConfig {

    @Bean
    public Client typesenseJavaClient() {
        Configuration config = new Configuration(
                List.of(new Node("http", "localhost", "8108")),
                Duration.of(5, ChronoUnit.SECONDS),
                "xyz123"
        );
        return new Client(config);
    }
}
