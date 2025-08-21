package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StakeholderDto {
    private Integer id;
    private String description;
    private Integer stakeholderGroupId;
    private String isActive;
}
