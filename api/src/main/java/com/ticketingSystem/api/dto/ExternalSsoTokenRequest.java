package com.ticketingSystem.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalSsoTokenRequest {
    private String username;
    private String clientId;
    private String authCode;
    private String secret;
}
