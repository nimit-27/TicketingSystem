package com.ticketingSystem.calendar.service.model;

import java.time.LocalTime;

public record WorkingWindow(LocalTime startTime, LocalTime endTime, boolean closed) {

    public static WorkingWindow closedDay() {
        return new WorkingWindow(null, null, true);
    }

    public boolean isOpen() {
        return !closed && startTime != null && endTime != null;
    }
}
