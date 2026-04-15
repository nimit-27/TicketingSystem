package com.ticketingSystem.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRequestDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.service.NagiosTicketSlaService;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NagiosMonitoringControllerTest {

    @Mock
    private NagiosTicketSlaService nagiosTicketSlaService;

    @InjectMocks
    private NagiosMonitoringController nagiosMonitoringController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(nagiosMonitoringController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void getTicketSlaSnapshotReturnsServiceResponse() throws Exception {
        NagiosTicketSlaSnapshotDto dto = new NagiosTicketSlaSnapshotDto(
                "ticketing-system",
                Instant.parse("2026-03-31T10:15:30Z"),
                10L,
                2L,
                BigDecimal.valueOf(80.0),
                0,
                List.of()
        );
        NagiosTicketSlaRequestDto request = new NagiosTicketSlaRequestDto();
        request.setLimit(25);

        when(nagiosTicketSlaService.fetchSnapshot(eq(25))).thenReturn(dto);

        mockMvc.perform(post("/ext/nagios/ticket-sla")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("ticketing-system"))
                .andExpect(jsonPath("$.totalRecords").value(10))
                .andExpect(jsonPath("$.breachedRecords").value(2))
                .andExpect(jsonPath("$.compliancePercentage").value(80.0));
    }

    @Test
    void getTicketSlaSnapshotAllowsMissingBody() throws Exception {
        NagiosTicketSlaSnapshotDto dto = new NagiosTicketSlaSnapshotDto(
                "ticketing-system",
                Instant.parse("2026-03-31T10:15:30Z"),
                0L,
                0L,
                BigDecimal.valueOf(100.0),
                0,
                List.of()
        );

        when(nagiosTicketSlaService.fetchSnapshot(isNull())).thenReturn(dto);

        mockMvc.perform(post("/ext/nagios/ticket-sla")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("ticketing-system"));
    }
}
