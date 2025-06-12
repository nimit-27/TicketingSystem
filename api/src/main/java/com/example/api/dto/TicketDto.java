package com.example.api.dto;

import com.example.api.enums.Mode;
import com.example.api.enums.Priority;
import com.example.api.enums.Severity;
import com.example.api.enums.TicketStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.time.LocalDateTime;

@Getter
@Setter
public class TicketDto {
    private int id;
    private Date reportedDate;
    private Mode mode;
    private int employeeId;
    private String subject;
    private String description;
    private String category;
    private String subCategory;
    private Priority priority;
    private Severity severity;
    private Severity recommendedSeverity;
    private String impact;
    private String severityRecommendedBy;
    private TicketStatus status;
    private String attachmentPath;
    private String assignToLevel;
    private String assignTo;
    private String assignedToLevel;
    private String assignedTo;
    private String assignedBy;
    @JsonProperty("isMaster")
    private boolean isMaster;
    private Integer masterId;
    private LocalDateTime lastModified;
}