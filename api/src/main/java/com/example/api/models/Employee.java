package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "employees")
@Getter // Replaces @Data for getters
@Setter // Replaces @Data for setters
// IMPORTANT: Configure EqualsAndHashCode to only use the ID field
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Employee {

    @Id
    @Column(name = "employee_id")
    @EqualsAndHashCode.Include
    private Integer employeeId;

    @Column(name = "user_id")
    private String userId;
    private String name;
    @Column(name = "email_id")
    private String emailId;
    private String mobileNo;
    private String office;

    @ManyToMany(mappedBy = "employees")
    private Set<Level> levels;
}
