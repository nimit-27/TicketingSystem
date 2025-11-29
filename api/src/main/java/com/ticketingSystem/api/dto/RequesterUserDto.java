package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RequesterUserDto {
    private String requesterUserId;
    private String username;
    private String name;
    private String firstName;
    private String middleName;
    private String lastName;
    private String emailId;
    private String mobileNo;
    private String office;
    private String password;
    private String roles;
    private String stakeholder;
    private LocalDateTime dateOfJoining;
    private LocalDateTime dateOfRetirement;
    private String officeType;
    private String officeCode;
}
