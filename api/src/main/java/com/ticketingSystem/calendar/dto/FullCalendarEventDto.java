package com.ticketingSystem.calendar.dto;

public record FullCalendarEventDto(
        String id,
        String title,
        String start,
        String end,
        Boolean allDay,
        String backgroundColor,
        String textColor
) {
}
