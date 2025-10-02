package com.example.api.exception;

/**
 * Exception thrown when a root cause analysis entry cannot be located for a ticket.
 */
public class RootCauseAnalysisNotFoundException extends ResourceNotFoundException {

    public RootCauseAnalysisNotFoundException(String ticketId) {
        super(String.format("Root cause analysis for ticket id %s not found", ticketId));
    }
}
