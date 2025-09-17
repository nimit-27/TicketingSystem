package com.example.api.exception;

/**
 * Exception thrown when a request violates business rules or expectations.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
