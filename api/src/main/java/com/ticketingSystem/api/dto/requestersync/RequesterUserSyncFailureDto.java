package com.ticketingSystem.api.dto.requestersync;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RequesterUserSyncFailureDto {
    private String sourceRecordId;
    private String externalUserId;
    private String requesterUserId;
    private String status;
    private String errorCode;
    private String errorMessage;
}
