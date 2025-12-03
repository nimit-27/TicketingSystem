package com.ticketingSystem.api.models;

import com.ticketingSystem.api.enums.Mode;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.enums.FeedbackStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @Column(name="ticket_id")
    private String id;
    @Column(name="reported_date")
    @CreationTimestamp
    private LocalDateTime reportedDate;
    @Enumerated(EnumType.STRING)
    private Mode mode;

    @Column(name = "mode_id")
    private String modeId;
    @Column(name = "user_id")
    private String userId;
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "requestor_name")
    private String requestorName;
    @Column(name = "requestor_email_id")
    private String requestorEmailId;
    @Column(name = "requestor_mobile_no")
    private String requestorMobileNo;
    private String office;
    @Column(name = "office_code")
    private String officeCode;
    @Column(name = "region_code")
    private String regionCode;
    @Column(name = "zone_code")
    private String zoneCode;
    @Column(name = "district_code")
    private String districtCode;
    @Column(name = "region_name")
    private String regionName;
    @Column(name = "district_name")
    private String districtName;

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

    public void setMode(Mode mode) {
        this.mode = mode;
        this.modeId = mode != null ? mode.getId() : null;
    }

    @PrePersist
    @PreUpdate
    private void syncModeId() {
        if (mode != null) {
            this.modeId = mode.getId();
        }
    }
}
