package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "ticket_cr_sequences", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"sequence_date"})
})
@Getter
@Setter
@NoArgsConstructor
public class TicketCrSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sequence_date", nullable = false)
    private LocalDate sequenceDate;

    @Column(name = "last_value", nullable = false)
    private long lastValue;

    @Version
    private long version;
}
