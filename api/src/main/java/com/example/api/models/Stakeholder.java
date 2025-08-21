package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "stakeholder")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Stakeholder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stakeholder_id")
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "description")
    private String description;

    @ManyToOne
    @JoinColumn(name = "sg_id")
    private StakeholderGroup stakeholderGroup;

    @Column(name = "is_active")
    private String isActive;
}
