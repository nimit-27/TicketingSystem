package com.example.api.exception;

/**
 * Exception thrown when feedback for a ticket cannot be located.
 */
public class FeedbackNotFoundException extends ResourceNotFoundException {

    public FeedbackNotFoundException(String ticketId) {
        super(String.format("Feedback for ticket id %s not found", ticketId));
    }
}
