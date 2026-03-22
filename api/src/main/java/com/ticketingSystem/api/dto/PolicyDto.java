package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PolicyDto {
    private Integer policyId;
    private String code;
    private String resource;
    private String effect;
    private String description;
    private Boolean isActive;
    private String updatedBy;
    private List<PolicyRuleDto> rules;
}
