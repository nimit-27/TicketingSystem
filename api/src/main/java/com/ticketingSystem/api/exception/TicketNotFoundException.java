package com.ticketingSystem.api.exception;

public class TicketNotFoundException extends ResourceNotFoundException {
    public TicketNotFoundException(String id) {
        super("Ticket with id " + id + " not found");
    }
}
