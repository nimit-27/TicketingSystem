package com.ticketingSystem.api.exception;

/**
 * Exception thrown when root cause analysis operations fail unexpectedly.
 */
public class RootCauseAnalysisProcessingException extends RuntimeException {

    public RootCauseAnalysisProcessingException(String ticketId, Throwable cause) {
        super(String.format("Error while processing root cause analysis for ticket id %s", ticketId), cause);
    }
}
