package com.example.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "priority_master")
@Getter
@Setter
public class Priority {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "priority_id")
    private String priorityId;

    @Column(name = "value")
    private String value;
}
