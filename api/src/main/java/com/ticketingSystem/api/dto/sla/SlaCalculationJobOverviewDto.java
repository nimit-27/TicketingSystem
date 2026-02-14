package com.ticketingSystem.api.dto.sla;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class SlaCalculationJobOverviewDto {
    boolean running;
    String runningJobId;
    String cronExpression;
    Integer batchSize;
    LocalDateTime nextScheduledAt;
    Long minutesUntilNextRun;
    List<TriggerJobDto> triggerJobs;
    List<SlaCalculationJobRunDto> history;
}
