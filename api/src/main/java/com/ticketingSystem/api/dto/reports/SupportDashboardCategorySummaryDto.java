package com.ticketingSystem.api.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportDashboardCategorySummaryDto {
    private String zone;
    private String regionName;
    private String districtName;
    private String category;
    private String subcategory;
    private String categoryName;
    private String subcategoryName;
    private Map<String, Long> severityCounts;
    private long pendingForAcknowledgement;
    private long totalTickets;
}
