package com.ticketingSystem.api.dto.requestersync;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequesterUserSyncRecordRequest {
    private String empId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String reportingManagerCode;
    private String reportingManagerName;
    private String mobileNumber;
    private String emailId;
    private String designation;
    private String dateOfJoining;
    private String dateOfRetirement;
    private String officeType;
    private String officeCode;
}
