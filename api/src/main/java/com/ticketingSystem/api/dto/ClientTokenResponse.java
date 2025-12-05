package com.ticketingSystem.api.dto;

public record ClientTokenResponse(String accessToken,
                                  long expiresInMinutes,
                                  String clientId) {
}
