package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RnoAppointedUserDto {
    private String rnoAppointedUserId;
    private String requesterUserId;
    private String officeCode;
    private String officeType;
    private String regionCode;
    private Boolean active;
    private String createdBy;
    private LocalDateTime createdOn;
    private String updatedBy;
    private LocalDateTime updatedOn;
}
