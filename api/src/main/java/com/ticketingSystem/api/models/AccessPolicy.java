package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "access_policy")
@Getter
@Setter
public class AccessPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "policy_id")
    private Integer policyId;

    @Column(name = "code", nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "resource", nullable = false, length = 100)
    private String resource;

    @Column(name = "effect", nullable = false, length = 20)
    private String effect;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;
}
