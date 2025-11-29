package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class HelpdeskUserDto {
    private String userId;
    private String username;
    private String name;
    private String emailId;
    private String mobileNo;
    private String office;
    private String password;
    private String roles;
    private String stakeholder;
    private List<String> levels;
}
