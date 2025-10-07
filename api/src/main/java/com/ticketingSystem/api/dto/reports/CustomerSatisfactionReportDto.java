package com.ticketingSystem.api.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSatisfactionReportDto {
    private long totalResponses;
    private double overallSatisfactionAverage;
    private double resolutionEffectivenessAverage;
    private double communicationSupportAverage;
    private double timelinessAverage;
    private double compositeScore;
}
