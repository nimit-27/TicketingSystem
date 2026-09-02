package com.ticketingSystem.api.dto.nagios;

public interface NagiosCountBySeverityView {
    String getSeverity();

    Long getTotalCount();

    Long getBreachCount();
}
