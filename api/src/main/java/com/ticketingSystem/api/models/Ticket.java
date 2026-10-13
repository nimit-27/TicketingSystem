package com.ticketingSystem.api.models;

import com.ticketingSystem.api.enums.Mode;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.enums.FeedbackStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");

    @Id
    @Column(name="ticket_id")
    private String id;
    @Column(name = "created_by")
    private String createdBy;
    @Column(name="reported_date")
//    @CreationTimestamp
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
    @Column(name = "depot_code")
    private String depotCode;
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
    @Column(name = "issue_type_id")
    private String issueTypeId;
    @ManyToOne
    @JoinColumn(name = "issue_type_id", referencedColumnName = "issue_type_id", insertable = false, updatable = false)
    private IssueType issueType;
    private String priority;
    @Column(name = "division")
    private String division;
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

    @JsonProperty("isAssignedBackFromFci")
    @Column(name = "is_assigned_back_from_fci")
    private boolean isAssignedBackFromFci;
    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "last_modified_utc")
    private Instant lastModifiedUtc;

    @Column(name = "last_modified_status_date")
    private LocalDateTime lastModifiedStatusDate;

    @Column(name = "last_modified_status_date_utc")
    private Instant lastModifiedStatusDateUtc;

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_at_utc")
    private Instant resolvedAtUtc;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "closed_at_utc")
    private Instant closedAtUtc;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_status")
    private FeedbackStatus feedbackStatus;

    @ManyToOne
    @JoinColumn(name = "status_id", referencedColumnName = "status_id")
    private Status status;

    @OneToOne(mappedBy = "ticket", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TicketSla ticketSla;

    @Transient
    private String remark;

    public void setMode(Mode mode) {
        this.mode = mode;
        this.modeId = mode != null ? mode.getId() : null;
    }

    public void setResolvedAtUtc(Instant resolvedAtUtc) {
        this.resolvedAtUtc = resolvedAtUtc;
        this.resolvedAt = resolvedAtUtc == null ? null : LocalDateTime.ofInstant(resolvedAtUtc, BUSINESS_ZONE);
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        setResolvedAtUtc(resolvedAt == null ? null : resolvedAt.atZone(BUSINESS_ZONE).toInstant());
    }

    public void setClosedAtUtc(Instant closedAtUtc) {
        this.closedAtUtc = closedAtUtc;
        this.closedAt = closedAtUtc == null ? null : LocalDateTime.ofInstant(closedAtUtc, BUSINESS_ZONE);
    }

    public void setClosedAt(LocalDateTime closedAt) {
        setClosedAtUtc(closedAt == null ? null : closedAt.atZone(BUSINESS_ZONE).toInstant());
    }

    @PrePersist
    private void prePersist() {
        Instant nowUtc = Instant.now();
        LocalDateTime nowLocal = LocalDateTime.ofInstant(nowUtc, BUSINESS_ZONE);

        if (reportedDate == null) {
            reportedDate = nowLocal;
        }
        if (createdAtUtc == null) {
            createdAtUtc = nowUtc;
        }
        backfillMissingUtcPairs();
    }

    @PreUpdate
    private void preUpdate() {
        backfillMissingUtcPairs();
    }

    private void backfillMissingUtcPairs() {
        if (resolvedAtUtc != null) {
            setResolvedAtUtc(resolvedAtUtc);
        } else if (resolvedAt != null) {
            setResolvedAt(resolvedAt);
        }
        if (closedAtUtc != null) {
            setClosedAtUtc(closedAtUtc);
        } else if (closedAt != null) {
            setClosedAt(closedAt);
        }
        if (lastModified != null && lastModifiedUtc == null) {
            lastModifiedUtc = lastModified.atZone(BUSINESS_ZONE).toInstant();
        }
        if (lastModifiedStatusDate != null && lastModifiedStatusDateUtc == null) {
            lastModifiedStatusDateUtc = lastModifiedStatusDate.atZone(BUSINESS_ZONE).toInstant();
        }
    }
}
