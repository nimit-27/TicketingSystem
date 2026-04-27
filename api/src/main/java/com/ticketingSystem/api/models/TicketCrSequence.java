package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "ticket_cr_sequences", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"sequence_date"})
})
@Getter
@Setter
@NoArgsConstructor
public class TicketCrSequence {

    @Id
    @Column(name = "id", nullable = false, length = 20)
    private String id;

    @Column(name = "sequence_date", nullable = false)
    private LocalDate sequenceDate;

    @Column(name = "last_value", nullable = false)
    private long lastValue;

    @Version
    private long version;

    @PrePersist
    private void assignIdIfMissing() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        }
    }
}
