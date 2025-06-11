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
    @Column(name = "level_id")
    @EqualsAndHashCode.Include
    private int levelId;
    @Column(name = "level_name")
    private String levelName;

    @ManyToMany
    @JoinTable(
            name = "employee_levels",
            joinColumns = @JoinColumn(name = "level_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private Set<Employee> employees;
}
