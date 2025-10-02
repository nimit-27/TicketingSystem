package com.example.api.exception;

/**
 * Exception thrown when feedback submission fails unexpectedly.
 */
public class FeedbackSubmissionException extends RuntimeException {

    public FeedbackSubmissionException(String ticketId, Throwable cause) {
        super(String.format("Error during submission of feedback for ticket id %s", ticketId), cause);
    }
}
