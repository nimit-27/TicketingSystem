package com.example.api.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/filegator")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FilegatorController {
    private static final Logger logger = LoggerFactory.getLogger(FilegatorController.class);

    @PostMapping("/login")
    public ResponseEntity<String> loginToFilegator(HttpSession session,
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

        String username = (String) session.getAttribute("username");
        String password = (String) session.getAttribute("password");

        if (username == null || password == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
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
}