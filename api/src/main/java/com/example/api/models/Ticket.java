package com.example.api.models;

import com.example.api.enums.Mode;
import com.example.api.enums.Priority;
import com.example.api.enums.Severity;
import com.example.api.enums.TicketStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.example.api.models.Requestor;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name="reported_date")
    private Date reportedDate;
    @Enumerated(EnumType.STRING)
    private Mode mode;
    @Column(name = "employee_id", insertable = false, updatable = false)
    private int employeeId;
    @ManyToOne
    @JoinColumn(name = "employee_id", referencedColumnName = "employee_id")
    private Employee employee;

    @Column(name = "requestor_id", insertable = false, updatable = false)
    private Integer requestorId;

    @ManyToOne
    @JoinColumn(name = "requestor_id", referencedColumnName = "requestor_id")
    private Requestor requestor;
    private String stakeholder;
    private String subject;
    private String description;
    private String category;
    @Column(name="sub_category")
    private String subCategory;
    @Enumerated(EnumType.STRING)
    private Priority priority;
    @Enumerated(EnumType.STRING)
    private Severity severity;
    @Enumerated(EnumType.STRING)
    @Column(name = "recommended_severity")
    private Severity recommendedSeverity;
    private String impact;
    @Column(name = "severity_recommended_by")
    private String severityRecommendedBy;
    @Enumerated(EnumType.STRING)
    private TicketStatus status;
    @Column(name="attachment_path")
    private String attachmentPath;

    @Column(name = "assigned_to_level")
    private String assignedToLevel;
    @Column(name = "assigned_to")
    private String assignedTo;
    @Column(name = "assigned_by")
    private String assignedBy;

    @JsonProperty("isMaster")
    @Column(name = "is_master")
    private boolean isMaster;
    private Integer masterId;
    @Column(name = "last_modified")
    private LocalDateTime lastModified;
}
