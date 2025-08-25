package com.example.api.dto;

import com.example.api.enums.Mode;
import com.example.api.enums.TicketStatus;
import com.example.api.enums.FeedbackStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.time.LocalDateTime;

@Getter
@Setter
public class TicketDto {
    private String id;
    private String shortId;
    private Date reportedDate;
    private Mode mode;
    private String userId;
    private String requestorName;
    private String requestorEmailId;
    private String requestorMobileNo;
    private String stakeholder;
    private String subject;
    private String description;
    private String category;
    private String categoryId;
    private String subCategory;
    private String subCategoryId;
    private String priority;
    private String severity;
    private String recommendedSeverity;
    private String impact;
    private String severityRecommendedBy;
    private TicketStatus status;
    private String statusId;
    private String statusLabel;
    private String statusName;
    private String attachmentPath;
    private String assignToLevel;
    private String assignTo;
    private String assignedToLevel;
    private String assignedTo;
    private String assignedBy;
    private String levelId;
    private String updatedBy;
    @JsonProperty("isMaster")
    private boolean isMaster;
    private String masterId;
    private LocalDateTime lastModified;
    private LocalDateTime resolvedAt;
    private FeedbackStatus feedbackStatus;
}
