package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.ClientTokenResponse;
import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.config.MobileClientProperties;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MobileClientAuthService {
    private final ClientCredentialService clientCredentialService;
    private final ClientTokenService clientTokenService;
    private final MobileClientProperties mobileClientProperties;

    public MobileClientAuthService(ClientCredentialService clientCredentialService,
                                   ClientTokenService clientTokenService,
                                   MobileClientProperties mobileClientProperties) {
        this.clientCredentialService = clientCredentialService;
        this.clientTokenService = clientTokenService;
        this.mobileClientProperties = mobileClientProperties;
    }

    // Previously authenticated using client credentials supplied in the body.
    // public Optional<ClientTokenResponse> exchangeCredentials(ClientCredentialRequest request) {
    //     return clientCredentialService.authenticate(request.getClientId(), request.getClientSecret())
    //             .map(this::issueTokenResponse);
    // }

    public Optional<ClientTokenResponse> issueMobileClientToken() {
        return clientCredentialService.findActiveByClientId(mobileClientProperties.getId())
                .map(this::issueTokenResponse);
    }

    private ClientTokenResponse issueTokenResponse(ClientCredential credential) {
        ClientTokenService.IssuedClientToken token = clientTokenService.issueAccessToken(credential);
        return new ClientTokenResponse(token.accessToken(), token.expiresInMinutes(), token.clientId());
    }
}
