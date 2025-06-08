package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "employee_details")
@Data
public class Employee {

    @Id
    @Column(name = "employee_id")
    private Integer employeeId;

    private String name;
    private String emailId;
    private String mobileNo;
    private String role;
    private String office;
}
