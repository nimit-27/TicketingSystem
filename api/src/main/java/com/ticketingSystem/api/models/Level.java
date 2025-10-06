package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "helpdesk_support_levels")
@Getter // Replaces @Data for getters
@Setter // Replaces @Data for setters
// IMPORTANT: Configure EqualsAndHashCode to only use the ID field
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Level {
    @Id
    @Column(name = "hl_level")
    @EqualsAndHashCode.Include
    private String levelId;

    @Column(name = "hl_name")
    private String levelName;
}
