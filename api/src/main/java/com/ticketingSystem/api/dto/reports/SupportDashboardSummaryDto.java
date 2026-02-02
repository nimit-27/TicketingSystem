package com.ticketingSystem.api.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportDashboardSummaryDto {
    private SupportDashboardSummarySectionDto allTickets;
    private SupportDashboardSummarySectionDto myWorkload;
    private List<SupportDashboardCategorySummaryDto> allTicketsByCategory;
    private List<SupportDashboardCategorySummaryDto> myWorkloadByCategory;
    private SupportDashboardOpenResolvedDto openResolved;
    private List<SupportDashboardSlaCompliancePointDto> slaCompliance;
    private List<SupportDashboardTicketVolumePointDto> ticketVolume;
    private Long unresolvedBreachedTickets;
}
