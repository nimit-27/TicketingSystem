package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @Column(name = "employee_id")
    private Integer employeeId;

    private String name;
    @Column(name = "user_id", unique = true)
    private String userId;
    private String email;
    private String phone;
    private String roles;
}
