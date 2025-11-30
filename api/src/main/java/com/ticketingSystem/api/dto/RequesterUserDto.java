package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

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
    private String roles;
    private List<String> roleNames;
    private List<String> roleIds;
    private String stakeholder;
    private String stakeholderId;
    private LocalDateTime dateOfJoining;
    private LocalDateTime dateOfRetirement;
    private String officeType;
    private String officeCode;
    private String zoneCode;
    private String regionCode;
    private String districtCode;
}
