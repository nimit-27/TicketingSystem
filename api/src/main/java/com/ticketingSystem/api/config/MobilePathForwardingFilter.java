package com.ticketingSystem.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Forwards mobile-prefixed endpoints (e.g. /helpdesk/m/tickets) to the
 * corresponding standard endpoint (e.g. /helpdesk/tickets) while keeping the
 * /m-prefixed mobile-only controllers untouched.
 */
@Component
@Order(1)
public class MobilePathForwardingFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !path.startsWith("/m/") || path.startsWith("/m/auth") || path.startsWith("/m/ping");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String pathWithinApplication = request.getRequestURI().substring(request.getContextPath().length());
        String forwardPath = pathWithinApplication.substring(2);
        request.getRequestDispatcher(forwardPath).forward(request, response);
    }
}
