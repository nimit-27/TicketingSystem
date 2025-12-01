package com.ticketingSystem.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class RoleLevelDto {
    private Integer roleId;
    private List<String> levelIds;
}
