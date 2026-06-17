package com.ticketingSystem.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class GenericUser {
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

    public abstract String getNotificationRecipientId();
}
