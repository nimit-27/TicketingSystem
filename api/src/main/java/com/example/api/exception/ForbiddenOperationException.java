package com.example.api.exception;

/**
 * Exception thrown when the current user attempts an action that is not permitted.
 */
public class ForbiddenOperationException extends RuntimeException {

    public ForbiddenOperationException(String message) {
        super(message);
    }
}
