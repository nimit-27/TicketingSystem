package com.ticketingSystem.api.dto;

import jakarta.validation.constraints.NotBlank;

public class ClientCredentialRequest {
    @NotBlank
    private String clientId;

    @NotBlank
    private String clientSecret;

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
}
