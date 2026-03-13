package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.MobileClientProperties;
import com.ticketingSystem.api.dto.ClientTokenResponse;
import com.ticketingSystem.api.models.ClientCredential;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MobileClientAuthServiceTest {

    @Mock
    private ClientCredentialService clientCredentialService;
    @Mock
    private ClientTokenService clientTokenService;

    private MobileClientProperties properties;

    @InjectMocks
    private MobileClientAuthService service;

    @BeforeEach
    void setUp() {
        properties = new MobileClientProperties();
        properties.setId("mobile-client");
        service = new MobileClientAuthService(clientCredentialService, clientTokenService, properties);
    }

    @Test
    void issueMobileClientTokenShouldReturnEmptyWhenNoActiveCredential() {
        when(clientCredentialService.findActiveByClientId("mobile-client")).thenReturn(Optional.empty());

        assertThat(service.issueMobileClientToken()).isEmpty();
    }

    @Test
    void issueMobileClientTokenShouldIssueTokenForActiveCredential() {
        ClientCredential credential = new ClientCredential();
        when(clientCredentialService.findActiveByClientId("mobile-client")).thenReturn(Optional.of(credential));
        when(clientTokenService.issueAccessToken(credential))
                .thenReturn(new ClientTokenService.IssuedClientToken("jwt", 30L, "mobile-client"));

        Optional<ClientTokenResponse> result = service.issueMobileClientToken();

        assertThat(result).isPresent();
        assertThat(result.get().accessToken()).isEqualTo("jwt");
        assertThat(result.get().expiresInMinutes()).isEqualTo(30L);
        assertThat(result.get().clientId()).isEqualTo("mobile-client");
    }
}
