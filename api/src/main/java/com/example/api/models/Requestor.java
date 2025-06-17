package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "requestors")
@Data
public class Requestor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "requestor_id")
    private Integer requestorId;

    private String name;

    @Column(name = "email_id")
    private String emailId;

    @Column(name = "mobile_no")
    private String mobileNo;

    @Column(name = "stakeholder_type")
    private String stakeholderType;
}
