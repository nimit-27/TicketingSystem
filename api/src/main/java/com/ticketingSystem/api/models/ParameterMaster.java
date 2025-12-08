package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "parameter_master")
@Getter
@Setter
public class ParameterMaster {

    @Id
    @Column(name = "parameter_id")
    private String parameterId;

    @Column(name = "code", unique = true)
    private String code;

    @Column(name = "label")
    private String label;

    @Column(name = "description")
    private String description;
}
