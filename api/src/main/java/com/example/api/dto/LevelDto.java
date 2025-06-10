package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class LevelDto {
    private int levelId;
    private String levelName;
    private Set<EmployeeDto> employees;
}
