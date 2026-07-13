package com.ticketingSystem.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.service.FileStorageService;
import com.ticketingSystem.api.service.OciUploadService;
import com.ticketingSystem.api.service.RateLimiterService;
import com.ticketingSystem.api.service.TicketAuthorizationService;
import com.ticketingSystem.api.service.TicketService;
import com.ticketingSystem.api.service.TicketSlaService;
import com.ticketingSystem.api.service.UserService;
import com.ticketingSystem.reportGenerator.repository.ReportArtifactRepository;
import com.ticketingSystem.reportGenerator.service.AsyncReportService;
import com.ticketingSystem.reportGenerator.service.ReportDownloadService;
import com.ticketingSystem.reportGenerator.repository.ReportRequestHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TicketControllerRateLimitTest {

    @Mock
    private TicketService ticketService;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private TicketSlaService ticketSlaService;
    @Mock
    private TicketAuthorizationService ticketAuthorizationService;
    @Mock
    private UserService userService;
    @Mock
    private ReportDownloadService reportDownloadService;
    @Mock
    private AsyncReportService asyncReportService;
    @Mock
    private ReportRequestHistoryRepository reportRequestHistoryRepository;
    @Mock
    private ReportArtifactRepository reportArtifactRepository;
    @Mock
    private OciUploadService ociUploadService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        TicketController controller = new TicketController(
                ticketService,
                fileStorageService,
                ticketSlaService,
                ticketAuthorizationService,
                userService,
                reportDownloadService,
                asyncReportService,
                reportRequestHistoryRepository,
                reportArtifactRepository,
                ociUploadService,
                new RateLimiterService()
        );
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(new ObjectMapper());
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(converter)
                .build();
    }

    @Test
    void createTicketAllowsRequestsWithinConfiguredRateLimit() throws Exception {
        TicketDto saved = new TicketDto();
        saved.setId("ticket-1");
        when(ticketService.addTicket(any(Ticket.class))).thenReturn(saved);

        mockMvc.perform(multipart("/tickets/add")
                        .param("userId", "requester-1")
                        .with(request -> authenticatedRequest(request, "requester-1", "10.1.0.10")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("ticket-1"));
    }

    @Test
    void createTicketReturnsTooManyRequestsAfterRateLimitIsExceeded() throws Exception {
        TicketDto saved = new TicketDto();
        saved.setId("ticket-1");
        when(ticketService.addTicket(any(Ticket.class))).thenReturn(saved);

        for (int i = 0; i < 20; i++) {
            mockMvc.perform(multipart("/tickets/add")
                            .param("userId", "requester-2")
                            .with(request -> authenticatedRequest(request, "requester-2", "10.1.0.20")))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(multipart("/tickets/add")
                        .param("userId", "requester-2")
                        .with(request -> authenticatedRequest(request, "requester-2", "10.1.0.20")))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.message").value("Too many create ticket requests. Please try again later."));

        verify(ticketService, times(20)).addTicket(any(Ticket.class));
    }

    @Test
    void createTicketRateLimitIsPerAuthenticatedPrincipalNotGlobal() throws Exception {
        TicketDto saved = new TicketDto();
        saved.setId("ticket-1");
        when(ticketService.addTicket(any(Ticket.class))).thenReturn(saved);

        for (int i = 0; i < 20; i++) {
            mockMvc.perform(multipart("/tickets/add")
                            .param("userId", "requester-3")
                            .with(request -> authenticatedRequest(request, "requester-3", "10.1.0.30")))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(multipart("/tickets/add")
                        .param("userId", "requester-4")
                        .with(request -> authenticatedRequest(request, "requester-4", "10.1.0.30")))
                .andExpect(status().isOk());

        mockMvc.perform(multipart("/tickets/add")
                        .param("userId", "requester-3")
                        .with(request -> authenticatedRequest(request, "requester-3", "10.1.0.30")))
                .andExpect(status().isTooManyRequests());

        verify(ticketService, times(21)).addTicket(any(Ticket.class));
    }

    private MockHttpServletRequest authenticatedRequest(MockHttpServletRequest request, String username, String remoteAddress) {
        request.setUserPrincipal((Principal) () -> username);
        request.setRemoteAddr(remoteAddress);
        return request;
    }
}
