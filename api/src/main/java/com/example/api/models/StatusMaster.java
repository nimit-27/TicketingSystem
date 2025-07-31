package com.example.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "status_master")
@Getter
@Setter
public class StatusMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "status_id")
    private String statusId;

    @Column(name = "status_name")
    private String statusName;

    @Column(name = "status_code")
    private String statusCode;

    @Column(name = "sla_flag")
    private Boolean slaFlag;

    private String description;
}
