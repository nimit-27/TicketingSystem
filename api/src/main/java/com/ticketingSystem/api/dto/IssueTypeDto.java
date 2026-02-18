package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class IssueTypeDto {
    private String issueTypeId;
    private String issueTypeLabel;
    private String description;
    private String isActive;
    private Boolean slaFlag;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
