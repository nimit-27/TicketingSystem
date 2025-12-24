package com.ticketingSystem.api.exception;

public class RateLimitExceededException extends RuntimeException {
    private final long retryAfterSeconds;

    public RateLimitExceededException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = Math.max(retryAfterSeconds, 0);
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
