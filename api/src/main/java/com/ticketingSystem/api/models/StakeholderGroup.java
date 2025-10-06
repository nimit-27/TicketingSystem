package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "stakeholder_group")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StakeholderGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sg_id")
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private String isActive;

    @OneToMany(mappedBy = "stakeholderGroup")
    private Set<Stakeholder> stakeholders;
}
