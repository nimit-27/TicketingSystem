package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.ClientCredentialRequest;
import com.ticketingSystem.api.dto.ClientTokenResponse;
import com.ticketingSystem.api.models.ClientCredential;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MobileClientAuthService {
    private final ClientCredentialService clientCredentialService;
    private final ClientTokenService clientTokenService;

    public MobileClientAuthService(ClientCredentialService clientCredentialService,
                                   ClientTokenService clientTokenService) {
        this.clientCredentialService = clientCredentialService;
        this.clientTokenService = clientTokenService;
    }

    public Optional<ClientTokenResponse> exchangeCredentials(ClientCredentialRequest request) {
        return clientCredentialService.authenticate(request.getClientId(), request.getClientSecret())
                .map(this::issueTokenResponse);
    }

    private ClientTokenResponse issueTokenResponse(ClientCredential credential) {
        ClientTokenService.IssuedClientToken token = clientTokenService.issueAccessToken(credential);
        return new ClientTokenResponse(token.accessToken(), token.expiresInMinutes(), token.clientId());
    }
}
