package com.ticketingSystem.api.dto.requestersync;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class RequesterUserSyncFailureResponse {
    private String sourceSystem;
    private String batchId;
    private List<RequesterUserSyncFailureDto> failures;
}
