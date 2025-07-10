package com.example.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "users")
@Getter // Replaces @Data for getters
@Setter // Replaces @Data for setters
// IMPORTANT: Configure EqualsAndHashCode to only use the ID field
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {

    @Id
    @Column(name = "user_id")
    @EqualsAndHashCode.Include
    private Integer userId;

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

    @ManyToMany(mappedBy = "users")
    private Set<Level> levels;
}
