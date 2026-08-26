package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.RateLimitExceededException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private final Map<String, FixedWindowCounter> counters = new ConcurrentHashMap<>();

    public void check(String key, int maxRequests, Duration window, String message) {
        if (key == null || key.isBlank()) {
            key = "anonymous";
        }
        String counterKey = key.trim();
        FixedWindowCounter counter = counters.computeIfAbsent(counterKey, ignored -> new FixedWindowCounter());
        synchronized (counter) {
            Instant now = Instant.now();
            if (counter.windowStart == null || !counter.windowStart.plus(window).isAfter(now)) {
                counter.windowStart = now;
                counter.requests = 0;
            }
            counter.requests++;
            if (counter.requests > maxRequests) {
                long retryAfterSeconds = Math.max(1, Duration.between(now, counter.windowStart.plus(window)).toSeconds());
                throw new RateLimitExceededException(message, retryAfterSeconds);
            }
        }
    }

    private static class FixedWindowCounter {
        Instant windowStart;
        int requests;
    }
}
