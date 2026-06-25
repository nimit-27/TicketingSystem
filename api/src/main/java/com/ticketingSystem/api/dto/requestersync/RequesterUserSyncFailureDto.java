package com.ticketingSystem.api.dto.requestersync;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RequesterUserSyncFailureDto {
    private Long requestId;
    private String empId;
    private String requesterUserId;
    private String status;
    private String errorCode;
    private String errorMessage;
}
