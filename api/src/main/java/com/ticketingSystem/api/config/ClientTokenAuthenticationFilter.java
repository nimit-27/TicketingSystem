package com.ticketingSystem.api.config;

import com.ticketingSystem.api.models.ClientToken;
import com.ticketingSystem.api.service.ClientTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class ClientTokenAuthenticationFilter extends OncePerRequestFilter {
    private final ClientTokenService clientTokenService;
    private final JwtProperties jwtProperties;
    private final KeycloakTokenVerifier keycloakTokenVerifier;

    public ClientTokenAuthenticationFilter(ClientTokenService clientTokenService,
                                           JwtProperties jwtProperties,
                                           KeycloakTokenVerifier keycloakTokenVerifier) {
        this.clientTokenService = clientTokenService;
        this.jwtProperties = jwtProperties;
        this.keycloakTokenVerifier = keycloakTokenVerifier;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (jwtProperties.isBypassEnabled()) {
            return true;
        }
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = resolvePath(request);
        boolean isClientPath = path.startsWith("/m") || path.startsWith("/ext");
        boolean isPublicClientPath = path.startsWith("/ext/auth/token");
        return !isClientPath || isPublicClientPath;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request.getHeader(HttpHeaders.AUTHORIZATION));
        if (token != null && isKeycloakAuthTokenRequest(request)) {
            try {
                keycloakTokenVerifier.verify(token);
                authenticateKeycloak(request);
                filterChain.doFilter(request, response);
                return;
            } catch (Exception ex) {
                writeUnauthorizedResponse(response);
                return;
            }
        }
        if (token != null) {
            ClientTokenService.TokenVerificationResult verificationResult = clientTokenService.verifyAccessToken(token);

            if (verificationResult.valid()) {
                authenticate(verificationResult.payload(), null, request);
                filterChain.doFilter(request, response);
                return;
            }
        }

        writeUnauthorizedResponse(response);
    }

    private void authenticate(ClientTokenService.ClientTokenPayload payload, ClientToken token, HttpServletRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }
        String clientId = payload != null && payload.clientId() != null
                ? payload.clientId()
                : token.getClientCredential() != null
                ? token.getClientCredential().getClientId()
                : "mobile-client";
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                clientId,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_MOBILE_CLIENT"))
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void authenticateKeycloak(HttpServletRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                "keycloak-client",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_MOBILE_CLIENT"))
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String resolvePath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isBlank() && uri.startsWith(contextPath)) {
            return uri.substring(contextPath.length());
        }
        return uri;
    }

    private String resolveToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authorizationHeader.substring(7).trim();
        return token.isBlank() ? null : token;
    }

    private boolean isKeycloakAuthTokenRequest(HttpServletRequest request) {
        return resolvePath(request).startsWith("/m/auth/token");
    }

    private void writeUnauthorizedResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Client token is missing or invalid\"}");
    }
}
