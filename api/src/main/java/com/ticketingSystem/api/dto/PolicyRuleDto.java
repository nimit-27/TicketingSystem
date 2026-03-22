package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyRuleDto {
    private Integer ruleId;
    private String conditionKey;
    private String operator;
    private String conditionValue;
    private Integer priority;
    private Boolean isActive;
}
