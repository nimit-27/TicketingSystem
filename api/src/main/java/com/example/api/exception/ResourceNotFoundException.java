package com.example.api.exception;

/**
 * Exception thrown when a requested resource cannot be located.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s with identifier %s not found", resourceName, identifier));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
