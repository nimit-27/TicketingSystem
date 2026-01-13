package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TokenPair;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Service
public class TokenCookieService {
    public static final String ACCESS_TOKEN_COOKIE = "access_token";
    public static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    public void addTokenCookies(HttpServletResponse response, TokenPair tokenPair) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildAccessCookie(tokenPair.token(), tokenPair.expiresInMinutes()).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(tokenPair.refreshToken(), tokenPair.refreshExpiresInMinutes()).toString());
    }

    public void clearTokenCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie(ACCESS_TOKEN_COOKIE).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie(REFRESH_TOKEN_COOKIE).toString());
    }

    public Optional<String> readAccessToken(HttpServletRequest request) {
        return readCookie(request, ACCESS_TOKEN_COOKIE);
    }

    public Optional<String> readRefreshToken(HttpServletRequest request) {
        return readCookie(request, REFRESH_TOKEN_COOKIE);
    }

    private Optional<String> readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }

    private ResponseCookie buildAccessCookie(String token, long expiresInMinutes) {
        return buildCookie(ACCESS_TOKEN_COOKIE, token, expiresInMinutes);
    }

    private ResponseCookie buildRefreshCookie(String token, long expiresInMinutes) {
        return buildCookie(REFRESH_TOKEN_COOKIE, token, expiresInMinutes);
    }

    private ResponseCookie buildCookie(String name, String value, long expiresInMinutes) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofMinutes(expiresInMinutes))
                .build();
    }

    private ResponseCookie clearCookie(String name) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }
}
