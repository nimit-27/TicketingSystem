package com.ticketingSystem.calendar.dto;

public record BusinessHoursDto(
        Integer startTimeMinutes,
        Integer endTimeMinutes,
        Integer[] daysOfWeek
) {
}
