package com.ticketingSystem.api.dto.sla;

import lombok.Data;

@Data
public class UpdateTriggerPeriodRequestDto {
    private String triggerPeriod;
    private String cronExpression;
}

