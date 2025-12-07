package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.AssignmentHistory;
import com.ticketingSystem.api.service.AssignmentHistoryService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AssignmentHistoryControllerTest {

    @Mock
    private AssignmentHistoryService assignmentHistoryService;

    @InjectMocks
    private AssignmentHistoryController assignmentHistoryController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(assignmentHistoryController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void getHistoryReturnsAssignmentHistoryForTicket() throws Exception {
        AssignmentHistory history = new AssignmentHistory();
        history.setId("history-1");
        history.setAssignedBy("user-a");
        history.setAssignedTo("user-b");
        history.setRemark("Initial assignment");
        history.setTimestamp(LocalDateTime.of(2024, 5, 1, 10, 0));

        when(assignmentHistoryService.getHistoryForTicket("ticket-123"))
                .thenReturn(List.of(history));

        mockMvc.perform(get("/assignment-history/{ticketId}", "ticket-123")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("history-1"))
                .andExpect(jsonPath("$[0].assignedBy").value("user-a"))
                .andExpect(jsonPath("$[0].assignedTo").value("user-b"))
                .andExpect(jsonPath("$[0].remark").value("Initial assignment"));
    }
}
