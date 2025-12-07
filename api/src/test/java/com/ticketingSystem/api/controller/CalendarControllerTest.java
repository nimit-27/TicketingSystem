package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.CalendarViewResponse;
import com.ticketingSystem.api.service.CalendarUiService;
import com.ticketingSystem.calendar.dto.BusinessHoursDto;
import com.ticketingSystem.calendar.dto.CalendarConfigDto;
import com.ticketingSystem.calendar.dto.FullCalendarEventDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CalendarControllerTest {

    @Mock
    private CalendarUiService calendarUiService;

    @InjectMocks
    private CalendarController calendarController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(calendarController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void getCalendarReturnsDataFromService() throws Exception {
        LocalDate from = LocalDate.of(2024, 1, 1);
        LocalDate to = LocalDate.of(2024, 1, 31);

        BusinessHoursDto defaultHours = new BusinessHoursDto(540, 1020, new Integer[]{1, 2, 3, 4, 5});
        CalendarConfigDto config = new CalendarConfigDto("UTC", defaultHours, List.of());
        FullCalendarEventDto event = new FullCalendarEventDto("1", "Meeting", "2024-01-10T09:00:00", "2024-01-10T10:00:00", false, "#fff", "#000");
        CalendarViewResponse response = new CalendarViewResponse(config, List.of(event));

        when(calendarUiService.loadCalendar(from, to)).thenReturn(response);

        mockMvc.perform(get("/api/calendar/view")
                        .param("from", from.toString())
                        .param("to", to.toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.config.timezone").value("UTC"))
                .andExpect(jsonPath("$.events[0].id").value("1"))
                .andExpect(jsonPath("$.events[0].title").value("Meeting"))
                .andExpect(jsonPath("$.events[0].allDay").value(false));
    }
}
