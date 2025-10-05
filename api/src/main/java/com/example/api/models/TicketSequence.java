package com.example.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "ticket_sequences", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"mode_id", "sequence_date"})
})
@Getter
@Setter
@NoArgsConstructor
public class TicketSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mode_id", nullable = false, length = 50)
    private String modeId;

    @Column(name = "sequence_date", nullable = false)
    private LocalDate sequenceDate;

    @Column(name = "last_value", nullable = false)
    private long lastValue;

    @Version
    private long version;
}
