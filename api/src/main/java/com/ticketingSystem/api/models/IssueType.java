package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "issue_type_master")
@Getter
@Setter
public class IssueType {

    @Id
    @Column(name = "issue_type_id")
    private String issueTypeId;

    @Column(name = "name")
    private String issueTypeLabel;

    private String description;

    private String isActive;

    @Column(name = "sla_flag")
    private Boolean slaFlag;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


}
