package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter // Replaces @Data for getters
@Setter // Replaces @Data for setters
// IMPORTANT: Configure EqualsAndHashCode to only use the ID field
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class User extends GenericUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    @EqualsAndHashCode.Include
    private String userId;


    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private UserLevel userLevel;

    @Override
    public String getGenericUserId() {
        return userId;
    }
}
