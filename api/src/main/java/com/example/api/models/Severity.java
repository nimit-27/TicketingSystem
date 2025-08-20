package com.example.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity representing severity configuration from {@code severity_master}.
 */
@Entity
@Table(name = "severity_master")
@Getter
@Setter
public class Severity {

    @Id
    @Column(name = "ts_id")
    private String id;

    @Column(name = "ts_level")
    private String level;

    @Column(name = "ts_description")
    private String description;

    @Column(name = "ts_weightage")
    private Integer weightage;

    @Column(name = "ts_active_flg")
    private String activeFlag;
}
