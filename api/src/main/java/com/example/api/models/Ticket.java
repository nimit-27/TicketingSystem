package com.example.api.models;

import com.example.api.enums.Mode;
import com.example.api.enums.TicketStatus;
import com.example.api.enums.FeedbackStatus;
import com.example.api.models.Status;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Date;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="ticket_id")
    private String id;
    @Column(name="reported_date")
    @CreationTimestamp
    private LocalDateTime reportedDate;
    @Enumerated(EnumType.STRING)
    private Mode mode;
    @Column(name = "user_id", insertable = false, updatable = false)
    private String userId;
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "requestor_name")
    private String requestorName;
    @Column(name = "requestor_email_id")
    private String requestorEmailId;
    @Column(name = "requestor_mobile_no")
    private String requestorMobileNo;

    private String stakeholder;
    private String subject;
    private String description;
    private String category;
    @Column(name="sub_category")
    private String subCategory;
    private String priority;
    private String severity;
    @Column(name = "recommended_severity")
    private String recommendedSeverity;
    private String impact;
    @Column(name = "severity_recommended_by")
    private String severityRecommendedBy;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TicketStatus ticketStatus;
    @Column(name = "assigned_to_level")
    private String assignedToLevel;

    @Column(name = "level_id")
    private String levelId;
    @Column(name = "assigned_to")
    private String assignedTo;
    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @JsonProperty("isMaster")
    @Column(name = "is_master")
    private boolean isMaster;
    @Column(name = "master_id")
    private String masterId;
    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_status")
    private FeedbackStatus feedbackStatus;

    @ManyToOne
    @JoinColumn(name = "status_id", referencedColumnName = "status_id")
    private Status status;

    @Transient
    private String remark;
}
