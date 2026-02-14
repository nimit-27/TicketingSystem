package com.ticketingSystem.api.dto.sla;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class TriggerJobDto {
    String triggerJobId;
    String triggerJobCode;
    String triggerJobName;
    Integer batchSize;
    String triggerPeriod;
    String cronExpression;
    Long minutesUntilNextRun;
    LocalDateTime nextScheduledAt;
    boolean running;
}

