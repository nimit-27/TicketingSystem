package com.example.api.dto;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeDto {
    private Integer employeeId;
    private String userId;
    private String name;
    private String emailId;
    private String mobileNo;
    private String office;
}
