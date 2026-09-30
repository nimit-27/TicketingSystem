package com.ticketingSystem.api.models;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;

class TicketSlaRelationshipTest {

    @Test
    void bidirectionalRelationshipDoesNotRecurseInGeneratedMethods() {
        Ticket ticket = new Ticket();
        ticket.setId("TKT-1");
        TicketSla sla = new TicketSla();
        sla.setId("SLA-1");
        ticket.setTicketSla(sla);
        sla.setTicket(ticket);

        assertThatCode(ticket::toString).doesNotThrowAnyException();
        assertThatCode(sla::toString).doesNotThrowAnyException();
        assertThatCode(ticket::hashCode).doesNotThrowAnyException();
        assertThatCode(sla::hashCode).doesNotThrowAnyException();
    }
}
