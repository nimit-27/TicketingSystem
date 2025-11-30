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
    private String roles;
    private List<String> roleNames;
    private List<String> roleIds;
    private String stakeholder;
    private String stakeholderId;
    private List<String> levels;
}
