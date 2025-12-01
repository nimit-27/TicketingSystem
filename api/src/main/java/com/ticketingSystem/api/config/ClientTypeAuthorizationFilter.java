package com.ticketingSystem.api.config;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.enums.ClientType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class ClientTypeAuthorizationFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/auth/login",
            "/auth/logout",
            "/helpdesk/auth/login",
            "/helpdesk/auth/logout"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Object clientTypeAttr = request.getAttribute(ClientTypeRoutingFilter.CLIENT_TYPE_ATTRIBUTE);
        ClientType requestedClientType = clientTypeAttr instanceof ClientType ? (ClientType) clientTypeAttr : ClientType.INTERNAL;

        if (requestedClientType == ClientType.MOBILE && requiresMobileAuthorization(request) && !isMobileRequestAuthorized()) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Mobile APIs require a mobile-scoped token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean requiresMobileAuthorization(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path != null && !PUBLIC_PATHS.contains(path);
    }

    private boolean isMobileRequestAuthorized() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof LoginPayload payload) {
            ClientType tokenClientType = payload.getClientType();
            if (tokenClientType == null) {
                tokenClientType = ClientType.INTERNAL;
            }
            return tokenClientType == ClientType.MOBILE;
        }

        return false;
    }
}
