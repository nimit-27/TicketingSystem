package com.example.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "severity_master")
@Getter
@Setter
public class Severity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "severity_id")
    private Integer severityId;

    @Column(name = "value")
    private String value;
}
