package com.ticketingSystem.api.dto.requestersync;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RequesterUserSyncBatchResponse {
    private String sourceSystem;
    private String batchId;
    private int accepted;
    private int duplicate;
    private int rejected;
    private String statusUrl;
}
