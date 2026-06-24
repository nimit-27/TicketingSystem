package com.ticketingSystem.api.dto.requestersync;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RequesterUserSyncRecordRequest {
    @NotBlank
    private String sourceRecordId;
    @NotBlank
    private String externalUserId;
    @NotBlank
    private String username;
    private String name;
    private String fullName;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String emailId;
    private String mobile;
    private String mobileNo;
    private String office;
    private String password;
    private String roles;
    private String stakeholder;
    private LocalDateTime dateOfJoining;
    private LocalDateTime dateOfRetirement;
    private String officeType;
    private String officeCode;
    private String zoneCode;
    private String regionCode;
    private String districtCode;
    private Boolean active;
}
