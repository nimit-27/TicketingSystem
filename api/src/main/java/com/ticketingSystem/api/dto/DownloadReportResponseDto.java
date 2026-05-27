package com.ticketingSystem.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DownloadReportResponseDto {
    private String requestId;
    private String reportCode;
    private String format;
    private RequestedByDetails requestedByDetails;
    private String requestedAt;
    private String completedAt;
    private String filtersJson;
    private String failedAt;
    private String errorMessage;
    private String expiresAt;
    private String filename;
    private String downloadPath;
    private String status;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequestedByDetails {
        private String userId;
        private String username;
        private String name;
    }
}
