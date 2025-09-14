package com.example.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Demonstrates basic SLF4J logging within a Spring service.
 */
@Service
public class LoggingService {

    private static final Logger logger = LoggerFactory.getLogger(LoggingService.class);

    /**
     * Sample method showing logs at different levels.
     */
    public void performSampleTask() {
        logger.info("Sample task started");
        logger.debug("Processing detailed steps");
        try {
            throw new IllegalStateException("Demo exception");
        } catch (IllegalStateException ex) {
            logger.error("Encountered error", ex);
        }
        logger.warn("Sample task completed with warnings");
    }
}

