package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "levels")
@Getter // Replaces @Data for getters
@Setter // Replaces @Data for setters
// IMPORTANT: Configure EqualsAndHashCode to only use the ID field
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "level_id")
    @EqualsAndHashCode.Include
    private String levelId;
    @Column(name = "level_name")
    private String levelName;

    @ManyToMany
    @JoinTable(
            name = "user_levels",
            joinColumns = @JoinColumn(name = "level_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> users;
}
