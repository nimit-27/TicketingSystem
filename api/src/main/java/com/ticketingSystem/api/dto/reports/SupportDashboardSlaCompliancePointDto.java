package com.ticketingSystem.api.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportDashboardSlaCompliancePointDto {
    private String month;
    private long withinSla;
    private long overdue;
}
