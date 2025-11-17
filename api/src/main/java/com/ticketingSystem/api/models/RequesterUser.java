package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "requester_users")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RequesterUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    @EqualsAndHashCode.Include
    private String userId;

    @Column(name = "username")
    private String username;
    private String name;
    @Column(name = "email_id")
    private String emailId;
    private String mobileNo;
    private String office;

    @Column(name = "password")
    private String password;

    private String roles;

    @Column(name = "stakeholder")
    private String stakeholder;
}
