package com.ticketingSystem.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
public class ExternalSsoTokenResponse {
    @JsonAlias({"token", "access_token", "accessToken"})
    private String accessToken;

    @JsonAlias({"expires_in", "expiresIn"})
    private Long expiresIn;
}
