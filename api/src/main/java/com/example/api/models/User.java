package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter // Replaces @Data for getters
@Setter // Replaces @Data for setters
// IMPORTANT: Configure EqualsAndHashCode to only use the ID field
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {

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

    // Stores the user's password for authentication
    @Column(name = "password")
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private UserLevel userLevel;

    private String roles;

    @Column(name = "stakeholder")
    private String stakeholder;
}
