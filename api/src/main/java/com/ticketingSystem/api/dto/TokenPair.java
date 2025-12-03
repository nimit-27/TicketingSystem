package com.ticketingSystem.api.dto;

public record TokenPair(String token,
                        String refreshToken,
                        long expiresInMinutes,
                        long refreshExpiresInMinutes) {
}
