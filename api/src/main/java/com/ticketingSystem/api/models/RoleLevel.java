package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "role_level")
@Getter
@Setter
public class RoleLevel {
    @Id
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "level_ids")
    private String levelIds;
}
