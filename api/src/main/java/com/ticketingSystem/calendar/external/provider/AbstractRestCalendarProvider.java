package com.ticketingSystem.calendar.external.provider;

import com.ticketingSystem.calendar.entity.CalendarSource;
import com.ticketingSystem.calendar.exception.CalendarException;
import com.ticketingSystem.calendar.repository.CalendarSourceRepository;
import org.springframework.web.reactive.function.client.WebClient;

public abstract class AbstractRestCalendarProvider {

    private final WebClient.Builder webClientBuilder;
    private final CalendarSourceRepository calendarSourceRepository;

    protected AbstractRestCalendarProvider(WebClient.Builder webClientBuilder,
                                           CalendarSourceRepository calendarSourceRepository) {
        this.webClientBuilder = webClientBuilder;
        this.calendarSourceRepository = calendarSourceRepository;
    }

    protected WebClient client(String providerCode) {
        CalendarSource source = calendarSourceRepository.findByProviderCodeAndEnabledTrue(providerCode)
                .orElseThrow(() -> new CalendarException("Calendar source not configured for " + providerCode));
        return webClientBuilder.clone().baseUrl(source.getBaseUrl()).defaultHeaders(headers -> {
            if (source.getApiKey() != null) {
                headers.set("X-API-KEY", source.getApiKey());
            }
        }).build();
    }
}
