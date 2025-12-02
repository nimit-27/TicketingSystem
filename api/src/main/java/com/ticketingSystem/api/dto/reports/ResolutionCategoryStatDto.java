package com.ticketingSystem.api.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolutionCategoryStatDto {
    private String category;
    private String subcategory;
    private String categoryName;
    private String subcategoryName;
    private long resolvedTickets;
    private long closedTickets;
    private double averageResolutionHours;
}
