package com.ticketingSystem.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonAlias({"refresh_expires_in", "refreshExpiresIn"})
    private Long refreshExpiresIn;

    @JsonAlias({"refresh_token", "refreshToken"})
    private String refreshToken;

    @JsonAlias({"token_type", "tokenType"})
    private String tokenType;

    @JsonProperty("not-before-policy")
    @JsonAlias({"not_before_policy", "notBeforePolicy"})
    private Long notBeforePolicy;

    @JsonAlias({"session_state", "sessionState"})
    private String sessionState;

    @JsonAlias({"scope"})
    private String scope;
}
