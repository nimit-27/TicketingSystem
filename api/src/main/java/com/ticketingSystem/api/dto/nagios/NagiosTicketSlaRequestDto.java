package com.ticketingSystem.api.dto.nagios;

import jakarta.validation.constraints.NotBlank;

public class NagiosTicketSlaRequestDto {
    @NotBlank
    private String clientId;

    @NotBlank
    private String clientSecret;

    private Integer limit;

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

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }
}
