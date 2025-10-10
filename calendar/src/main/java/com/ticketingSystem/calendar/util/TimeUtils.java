package com.ticketingSystem.calendar.util;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class TimeUtils {

    public static final ZoneId ZONE_ID = ZoneId.of("Asia/Kolkata");
    public static final String DEFAULT_REGION = "IN-WB-Kolkata";
    private static final DateTimeFormatter ISO_OFFSET_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private TimeUtils() {
    }

    public static String formatIso(ZonedDateTime value) {
        return value.withZoneSameInstant(ZONE_ID).format(ISO_OFFSET_FORMATTER);
    }

    public static ZonedDateTime parseIso(String value) {
        return ZonedDateTime.parse(value, ISO_OFFSET_FORMATTER).withZoneSameInstant(ZONE_ID);
    }

    public static int toMinutes(LocalTime time) {
        return time.getHour() * 60 + time.getMinute();
    }

    public static LocalTime parseLocalTime(String value) {
        return LocalTime.parse(value);
    }

    public static String toClockFormat(LocalTime time) {
        return time.toString();
    }

    public static int[] toFullCalendarDays(int[] isoDays) {
        int[] fcDays = new int[isoDays.length];
        for (int i = 0; i < isoDays.length; i++) {
            fcDays[i] = mapIsoDayToFullCalendar(isoDays[i]);
        }
        return fcDays;
    }

    public static int mapIsoDayToFullCalendar(int isoDay) {
        int index = isoDay - 1;
        return index < 0 ? 0 : index % 7;
    }

    public static int mapFullCalendarToIso(int fullCalendarDay) {
        return fullCalendarDay + 1;
    }

    public static DayOfWeek toDayOfWeek(int isoDay) {
        return DayOfWeek.of(isoDay);
    }

    public static ZonedDateTime atZone(LocalDate date, LocalTime time) {
        return date.atTime(time).atZone(ZONE_ID);
    }

    public static Duration windowDuration(LocalTime start, LocalTime end) {
        return Duration.between(start, end);
    }

    public static String capitalise(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return value.substring(0, 1).toUpperCase(Locale.ENGLISH) + value.substring(1);
    }
}
