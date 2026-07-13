package com.ticketingSystem.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.service.RateLimiterService;
import com.ticketingSystem.api.service.RequesterUserService;
import com.ticketingSystem.api.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerRateLimitTest {

    @Mock
    private UserService userService;

    @Mock
    private RequesterUserService requesterUserService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        UserController controller = new UserController(userService, requesterUserService, new RateLimiterService());
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(converter)
                .build();
    }

    @Test
    void addUserAllowsRequestsWithinConfiguredRateLimit() throws Exception {
        User saved = new User();
        saved.setName("Escalation User");
        when(userService.saveUser(any(User.class))).thenReturn(saved);

        mockMvc.perform(post("/users")
                        .with(request -> {
                            request.setRemoteAddr("10.0.0.10");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Escalation User\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User Escalation User added successfully"));
    }

    @Test
    void addUserReturnsTooManyRequestsAfterRateLimitIsExceeded() throws Exception {
        User saved = new User();
        saved.setName("Escalation User");
        when(userService.saveUser(any(User.class))).thenReturn(saved);

        String payload = "{\"name\":\"Escalation User\"}";
        for (int i = 0; i < 20; i++) {
            mockMvc.perform(post("/users")
                            .with(request -> {
                                request.setRemoteAddr("10.0.0.20");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/users")
                        .with(request -> {
                            request.setRemoteAddr("10.0.0.20");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.message").value("Too many add user requests. Please try again later."));

        verify(userService, times(20)).saveUser(any(User.class));
    }

    @Test
    void addUserRateLimitIsPerAuthenticatedPrincipalNotGlobal() throws Exception {
        User saved = new User();
        saved.setName("Escalation User");
        when(userService.saveUser(any(User.class))).thenReturn(saved);

        String payload = "{\"name\":\"Escalation User\"}";
        for (int i = 0; i < 20; i++) {
            mockMvc.perform(post("/users")
                            .with(request -> authenticatedRequest(request, "admin-one", "10.0.0.30"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/users")
                        .with(request -> authenticatedRequest(request, "admin-two", "10.0.0.30"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(post("/users")
                        .with(request -> authenticatedRequest(request, "admin-one", "10.0.0.30"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isTooManyRequests());

        verify(userService, times(21)).saveUser(any(User.class));
    }

    private MockHttpServletRequest authenticatedRequest(MockHttpServletRequest request, String username, String remoteAddress) {
        request.setUserPrincipal((Principal) () -> username);
        request.setRemoteAddr(remoteAddress);
        return request;
    }
}
