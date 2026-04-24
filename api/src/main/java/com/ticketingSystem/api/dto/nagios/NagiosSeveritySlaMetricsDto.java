package com.ticketingSystem.api.dto.nagios;

import java.math.BigDecimal;

public record NagiosSeveritySlaMetricsDto(long totalCount,
                                          long breachCount,
                                          BigDecimal breachPercentage,
                                          BigDecimal averageResolutionTimeMinutes,
                                          BigDecimal averageResponseTimeMinutes) {
}
