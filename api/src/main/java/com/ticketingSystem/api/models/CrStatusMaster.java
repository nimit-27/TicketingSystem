package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cr_status_master")
@Getter
@Setter
public class CrStatusMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cr_status_id")
    private String crStatusId;

    @Column(name = "cr_status_name", nullable = false)
    private String crStatusName;

    @Column(name = "cr_status_code", nullable = false, unique = true)
    private String crStatusCode;

    @Column(name = "description")
    private String description;

    @Column(name = "color")
    private String color;

    @Column(name = "created_on", insertable = false, updatable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_on", insertable = false, updatable = false)
    private LocalDateTime updatedOn;

    @Column(name = "created_by", insertable = false, updatable = false)
    private String createdBy;

    @Column(name = "updated_by", insertable = false, updatable = false)
    private String updatedBy;
}
