package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RnoAppointedUserHistoryDto {
    private String rnoAppointedUserHistoryId;
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
    private LocalDateTime historyRecordedOn;
}
