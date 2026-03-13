package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.ClientCredentialRequest;
import com.ticketingSystem.api.dto.ClientTokenResponse;
import com.ticketingSystem.api.models.ClientCredential;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalClientAuthServiceTest {

    @Mock
    private ClientCredentialService clientCredentialService;
    @Mock
    private ClientTokenService clientTokenService;

    @InjectMocks
    private ExternalClientAuthService service;

    @Test
    void exchangeCredentialsShouldReturnEmptyWhenAuthenticationFails() {
        ClientCredentialRequest request = new ClientCredentialRequest();
        request.setClientId("client");
        request.setClientSecret("wrong");
        when(clientCredentialService.authenticate("client", "wrong")).thenReturn(Optional.empty());

        assertThat(service.exchangeCredentials(request)).isEmpty();
    }

    @Test
    void exchangeCredentialsShouldIssueTokenWhenAuthenticationSucceeds() {
        ClientCredentialRequest request = new ClientCredentialRequest();
        request.setClientId("client");
        request.setClientSecret("secret");
        ClientCredential credential = new ClientCredential();
        when(clientCredentialService.authenticate("client", "secret")).thenReturn(Optional.of(credential));
        when(clientTokenService.issueAccessToken(credential))
                .thenReturn(new ClientTokenService.IssuedClientToken("jwt", 15L, "client"));

        Optional<ClientTokenResponse> result = service.exchangeCredentials(request);

        assertThat(result).isPresent();
        assertThat(result.get().accessToken()).isEqualTo("jwt");
        assertThat(result.get().expiresInMinutes()).isEqualTo(15L);
        assertThat(result.get().clientId()).isEqualTo("client");
        verify(clientTokenService).issueAccessToken(credential);
    }
}
