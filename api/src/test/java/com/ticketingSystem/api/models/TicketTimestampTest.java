package com.ticketingSystem.api.models;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class TicketTimestampTest {
    @Test
    void utcTimestampsProduceKolkataTimesAcrossDayBoundary() {
        Ticket ticket = new Ticket();
        Instant utc = Instant.parse("2026-10-13T20:45:12.123456Z");
        LocalDateTime local = LocalDateTime.parse("2026-10-14T02:15:12.123456");

        ticket.setResolvedAtUtc(utc);
        ticket.setClosedAtUtc(utc);

        assertThat(ticket.getResolvedAtUtc()).isEqualTo(utc);
        assertThat(ticket.getClosedAtUtc()).isEqualTo(utc);
        assertThat(ticket.getResolvedAt()).isEqualTo(local);
        assertThat(ticket.getClosedAt()).isEqualTo(local);
    }

    @Test
    void localHistoryCorrectionsUpdateUtcPairs() {
        Ticket ticket = new Ticket();
        ticket.setResolvedAtUtc(Instant.EPOCH);
        ticket.setClosedAtUtc(Instant.EPOCH);
        LocalDateTime local = LocalDateTime.parse("2026-10-14T02:15:12.123456");
        Instant utc = Instant.parse("2026-10-13T20:45:12.123456Z");

        ticket.setResolvedAt(local);
        ticket.setClosedAt(local);

        assertThat(ticket.getResolvedAtUtc()).isEqualTo(utc);
        assertThat(ticket.getClosedAtUtc()).isEqualTo(utc);
        assertThat(ticket.getResolvedAt()).isEqualTo(local);
        assertThat(ticket.getClosedAt()).isEqualTo(local);
    }

    @Test
    void clearingEitherSideClearsItsPair() {
        Ticket ticket = new Ticket();
        ticket.setResolvedAtUtc(Instant.EPOCH);
        ticket.setClosedAtUtc(Instant.EPOCH);
        ticket.setResolvedAt(null);
        ticket.setClosedAt(null);
        assertThat(ticket.getResolvedAtUtc()).isNull();
        assertThat(ticket.getClosedAtUtc()).isNull();

        ticket.setResolvedAt(LocalDateTime.of(2026, 10, 13, 12, 0));
        ticket.setClosedAt(LocalDateTime.of(2026, 10, 13, 12, 0));
        ticket.setResolvedAtUtc(null);
        ticket.setClosedAtUtc(null);
        assertThat(ticket.getResolvedAt()).isNull();
        assertThat(ticket.getClosedAt()).isNull();
    }
}
