package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "division_master")
@Getter
@Setter
public class DivisionMaster {

    @Id
    @Column(name = "division_id")
    private String divisionId;

    @Column(name = "division_name")
    private String divisionName;

    @Column(name = "division_code")
    private String divisionCode;

    private String description;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "is_active")
    private String isActive;
}
