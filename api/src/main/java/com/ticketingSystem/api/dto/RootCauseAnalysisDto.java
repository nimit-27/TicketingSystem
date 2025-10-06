package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RootCauseAnalysisDto {
    private String ticketId;
    private String severityId;
    private String severityLabel;
    private String severityDisplay;
    private String descriptionOfCause;
    private String resolutionDescription;
    private List<String> attachments;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
