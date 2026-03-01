package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DivisionDto {
    private String divisionId;
    private String divisionName;
    private String divisionCode;
    private String description;
    private String isActive;
}
