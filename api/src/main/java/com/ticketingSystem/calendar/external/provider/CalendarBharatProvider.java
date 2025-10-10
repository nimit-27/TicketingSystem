package com.ticketingSystem.calendar.external.provider;

import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import com.ticketingSystem.calendar.entity.Holiday;
import com.ticketingSystem.calendar.external.ExternalCalendarProvider;
import com.ticketingSystem.calendar.mapper.FullCalendarMapper;
import com.ticketingSystem.calendar.repository.CalendarSourceRepository;
import com.ticketingSystem.calendar.util.TimeUtils;

import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class CalendarBharatProvider extends AbstractRestCalendarProvider implements ExternalCalendarProvider {

    public static final String CODE = "CALENDAR_BHARAT";
    private final FullCalendarMapper fullCalendarMapper;

    public CalendarBharatProvider(WebClient.Builder builder,
                                  CalendarSourceRepository repository,
                                  FullCalendarMapper fullCalendarMapper) {
        super(builder, repository);
        this.fullCalendarMapper = fullCalendarMapper;
    }

    @Override
    public String providerCode() {
        return CODE;
    }

    @Override
    public List<Holiday> fetchHolidays(Year year, String region) {
        WebClient client = client(CODE);
        List<?> response = client.get()
                .uri(uriBuilder -> uriBuilder.path("/api/v1/holidays")
                        .queryParam("year", year.getValue())
                        .queryParam("region", region)
                        .build())
                .retrieve()
                .bodyToMono(List.class)
                .block();
        return response != null ? toDomain(response) : List.of();
    }

    @Override
    public List<FullCalendarEventDto> toFullCalendarEvents(List<Holiday> holidays, ZoneId zoneId) {
        return holidays.stream().map(holiday -> fullCalendarMapper.toHolidayEvent(holiday, zoneId)).toList();
    }

    @Override
    public List<Holiday> toDomain(Object raw) {
        List<Holiday> holidays = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object entry : list) {

                if (entry instanceof Map<?, ?> rawMap && rawMap.get("date") != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) rawMap;

                    LocalDate date = LocalDate.parse(String.valueOf(map.get("date")));
                    String name = String.valueOf(map.getOrDefault("name", "Holiday"));
                    String region = String.valueOf(map.getOrDefault("region", TimeUtils.DEFAULT_REGION));
                    boolean optional = Boolean.parseBoolean(String.valueOf(map.getOrDefault("optional", false)));

                    holidays.add(Holiday.builder()
                            .date(date)
                            .name(name)
                            .region(region)
                            .optional(optional)
                            .build());
                }

            }
        }
        return holidays;
    }
}
