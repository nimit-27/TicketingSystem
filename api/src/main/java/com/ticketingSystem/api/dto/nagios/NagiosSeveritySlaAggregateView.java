package com.ticketingSystem.api.dto.nagios;

public interface NagiosSeveritySlaAggregateView {
    String getSeverity();

    Long getTotalCount();

    Long getBreachCount();

    Double getAverageResolutionTimeMinutes();

    Double getAverageResponseTimeMinutes();
}
