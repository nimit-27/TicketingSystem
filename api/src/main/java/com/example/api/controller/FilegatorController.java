package com.example.api.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
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

    @PostMapping("/login")
    public ResponseEntity<String> login(HttpServletResponse servletResponse) {
        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("username", "admin");
        body.add("password", "admin");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity("http://localhost:8081/?r=/login", request, String.class);

        System.out.println("response of filegator login: " + response);
        List<String> cookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (cookies != null) {
            for (String cookie : cookies) {
                servletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie);
            }
        }
        return ResponseEntity
                .status(response.getStatusCode())
                .header(String.valueOf(response.getHeaders()))
                .body(response.getBody());
    }
}
