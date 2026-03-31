package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.service.NagiosTicketSlaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NagiosMonitoringControllerTest {

    @Mock
    private NagiosTicketSlaService nagiosTicketSlaService;

    @InjectMocks
    private NagiosMonitoringController nagiosMonitoringController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(nagiosMonitoringController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void getTicketSlaSnapshotReturnsServiceResponse() throws Exception {
        Authentication authentication = new UsernamePasswordAuthenticationToken("nagios-client", null, List.of());
        NagiosTicketSlaSnapshotDto dto = new NagiosTicketSlaSnapshotDto(
                "ticketing-system",
                Instant.parse("2026-03-31T10:15:30Z"),
                10L,
                2L,
                BigDecimal.valueOf(80.0),
                0,
                List.of()
        );

        when(nagiosTicketSlaService.fetchSnapshot(eq(authentication), eq("secret"), eq(25))).thenReturn(dto);

        mockMvc.perform(get("/ext/nagios/ticket-sla")
                        .principal(authentication)
                        .header("X-Nagios-Api-Key", "secret")
                        .param("limit", "25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("ticketing-system"))
                .andExpect(jsonPath("$.totalRecords").value(10))
                .andExpect(jsonPath("$.breachedRecords").value(2))
                .andExpect(jsonPath("$.compliancePercentage").value(80.0));
    }
}
