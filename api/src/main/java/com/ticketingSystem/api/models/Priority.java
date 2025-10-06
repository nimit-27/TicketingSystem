package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents priority configuration stored in {@code priority_master}.
 * The table stores descriptive details for each priority level which are
 * surfaced to the UI for contextual help.
 */
@Entity
@Table(name = "priority_master")
@Getter
@Setter
public class Priority {

    @Id
    @Column(name = "tp_id")
    private String id;

    @Column(name = "tp_level")
    private String level;

    @Column(name = "tp_description")
    private String description;

    @Column(name = "tp_weightage")
    private Integer weightage;

    @Column(name = "tp_active_flg")
    private String activeFlag;
}
