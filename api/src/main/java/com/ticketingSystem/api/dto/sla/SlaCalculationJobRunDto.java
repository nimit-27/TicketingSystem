package com.ticketingSystem.api.dto.sla;

import com.ticketingSystem.api.enums.SlaJobRunStatus;
import com.ticketingSystem.api.enums.SlaJobScope;
import com.ticketingSystem.api.enums.SlaJobTriggerType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class SlaCalculationJobRunDto {
    String id;
    SlaJobTriggerType triggerType;
    SlaJobScope scope;
    SlaJobRunStatus runStatus;
    String triggeredBy;
    LocalDateTime startedAt;
    LocalDateTime completedAt;
    Long durationMs;
    Long totalCandidateTickets;
    Long processedTickets;
    Long succeededTickets;
    Long failedTickets;
    Integer batchSize;
    String errorSummary;
}
