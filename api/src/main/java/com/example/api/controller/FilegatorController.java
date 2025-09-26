package com.example.api.controller;

import com.example.api.config.JwtProperties;
import com.example.api.dto.LoginPayload;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/filegator")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class FilegatorController {
    private static final Logger logger = LoggerFactory.getLogger(FilegatorController.class);

    private final JwtProperties jwtProperties;

    @PostMapping("/login")
    @PreAuthorize("@jwtProperties.isBypassEnabled() or isAuthenticated()")
    public ResponseEntity<String> loginToFilegator(
            @AuthenticationPrincipal LoginPayload authenticatedUser,
            @RequestBody(required = false) Map<String, String> credentials,
            HttpSession session,
            HttpServletResponse servletResponse) {
        RestTemplate restTemplate = new RestTemplate();

        // obtain csrf token and session cookie
        ResponseEntity<String> init = restTemplate.exchange(
                "http://localhost:8081/?r=/getuser",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                String.class);

        String csrfToken = init.getHeaders().getFirst("X-CSRF-Token");
        String sessionCookie = init.getHeaders().getFirst(HttpHeaders.SET_COOKIE);

        String username = resolveUsername(authenticatedUser, session);
        String password = resolvePassword(credentials);

        if (username == null || password == null) {
            String message = jwtProperties.isBypassEnabled()
                    ? "Username and password are required to login to Filegator when bypass mode is active"
                    : "Username and password (provided in the request body) are required to login to Filegator";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("username", username);
        body.add("password", password);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        if (csrfToken != null) {
            headers.set("X-CSRF-Token", csrfToken);
        }
        if (sessionCookie != null) {
            headers.set(HttpHeaders.COOKIE, sessionCookie.split(";", 2)[0]);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity("http://localhost:8081/?r=/login", request, String.class);

        logger.info("response of filegator login: {}", response);
        List<String> cookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (cookies != null) {
            for (String cookie : cookies) {
                servletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie);
            }
        }
        return ResponseEntity
                .status(response.getStatusCode())
                .body(response.getBody());
    }

    private String resolveUsername(LoginPayload authenticatedUser, HttpSession session) {
        if (authenticatedUser != null) {
            return authenticatedUser.getUsername();
        }
        Object username = session.getAttribute("username");
        return username instanceof String ? (String) username : null;
    }

    private String resolvePassword(Map<String, String> credentials) {
        if (credentials == null) {
            return null;
        }
        String password = credentials.get("password");
        return password != null && !password.isBlank() ? password : null;
    }
}