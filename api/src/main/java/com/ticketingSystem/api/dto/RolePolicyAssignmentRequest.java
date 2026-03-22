package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RolePolicyAssignmentRequest {
    private List<Integer> policyIds;
    private List<String> policyCodes;
    private String updatedBy;
}
