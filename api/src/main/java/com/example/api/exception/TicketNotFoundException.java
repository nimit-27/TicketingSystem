package com.example.api.exception;

public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String id) {
        super("Ticket with id " + id + " not found");
    }
}
