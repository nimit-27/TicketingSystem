package com.example.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_permission_config")
@Getter
@Setter
public class Role {
    @Id
    @Column(name = "role", length = 100)
    private String role;

    @Lob
    @Column(name = "permissions", columnDefinition = "json")
    private String permissions;

    @Column(name = "allowed_status_action_ids")
    private String allowedStatusActionIds;

    @Column(name = "description")
    private String description;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}
