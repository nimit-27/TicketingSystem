package com.ticketingSystem.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.ApiError;
import com.ticketingSystem.api.dto.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;
import java.time.LocalDateTime;

public class SessionExpiredAuthenticationEntryPoint implements AuthenticationEntryPoint {
    public static final String SESSION_EXPIRED_ATTRIBUTE = "sessionExpired";
    private static final String SESSION_EXPIRED_MESSAGE = "Session has expired. Please login again.";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        boolean sessionExpired = Boolean.TRUE.equals(request.getAttribute(SESSION_EXPIRED_ATTRIBUTE));
        if (!sessionExpired) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        ApiError apiError = new ApiError(SESSION_EXPIRED_MESSAGE, HttpStatus.FORBIDDEN.value(), request.getRequestURI());
        ApiResponse<Void> body = new ApiResponse<>(false, null, apiError, LocalDateTime.now());
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
