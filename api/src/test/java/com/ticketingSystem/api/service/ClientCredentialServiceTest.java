package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.models.ClientToken;
import com.ticketingSystem.api.repository.ClientCredentialRepository;
import com.ticketingSystem.api.repository.ClientTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientCredentialServiceTest {

    @Mock
    private ClientCredentialRepository clientCredentialRepository;
    @Mock
    private ClientTokenRepository clientTokenRepository;

    @InjectMocks
    private ClientCredentialService service;

    @Test
    void registerClientShouldPersistHashedSecretAndMetadata() {
        when(clientCredentialRepository.save(any(ClientCredential.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ClientCredential credential = service.registerClient("client-a", "raw-secret", "description");

        assertThat(credential.getClientId()).isEqualTo("client-a");
        assertThat(credential.getDescription()).isEqualTo("description");
        assertThat(credential.getCreatedAt()).isNotNull();
        assertThat(BCrypt.checkpw("raw-secret", credential.getClientSecretHash())).isTrue();
    }

    @Test
    void authenticateAndValidateShouldRespectBcryptSecretComparison() {
        ClientCredential credential = new ClientCredential();
        credential.setClientSecretHash(BCrypt.hashpw("secret", BCrypt.gensalt()));
        when(clientCredentialRepository.findByClientIdAndRevokedAtIsNull("client"))
                .thenReturn(Optional.of(credential));

        assertThat(service.authenticate("client", "secret")).contains(credential);
        assertThat(service.authenticate("client", "wrong")).isEmpty();
        assertThat(service.validateClientSecret("client", "secret")).isTrue();
        assertThat(service.validateClientSecret("client", "wrong")).isFalse();
    }

    @Test
    void recordAccessTokenShouldPersistFieldsAndIssuedAt() {
        ClientCredential credential = new ClientCredential();
        when(clientTokenRepository.save(any(ClientToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        LocalDateTime accessExpiry = LocalDateTime.now().plusMinutes(30);
        ClientToken token = service.recordAccessToken(credential, "access-hash", accessExpiry, "refresh-hash", null);

        assertThat(token.getClientCredential()).isEqualTo(credential);
        assertThat(token.getAccessTokenHash()).isEqualTo("access-hash");
        assertThat(token.getRefreshTokenHash()).isEqualTo("refresh-hash");
        assertThat(token.getAccessTokenExpiresAt()).isEqualTo(accessExpiry);
        assertThat(token.getIssuedAt()).isNotNull();
    }

    @Test
    void findAndRevokeMethodsShouldDelegateToRepositories() {
        ClientCredential credential = new ClientCredential();
        ClientToken token = new ClientToken();
        when(clientTokenRepository.findActiveByAccessTokenHash(any(), any())).thenReturn(Optional.of(token));
        when(clientTokenRepository.findActiveByRefreshTokenHash(any(), any())).thenReturn(Optional.of(token));

        assertThat(service.findActiveToken("a")).contains(token);
        assertThat(service.findActiveRefreshToken("r")).contains(token);

        service.revokeCredential(credential);
        service.revokeToken(token);

        ArgumentCaptor<ClientCredential> credentialCaptor = ArgumentCaptor.forClass(ClientCredential.class);
        verify(clientCredentialRepository).save(credentialCaptor.capture());
        assertThat(credentialCaptor.getValue().getRevokedAt()).isNotNull();

        ArgumentCaptor<ClientToken> tokenCaptor = ArgumentCaptor.forClass(ClientToken.class);
        verify(clientTokenRepository).save(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getRevokedAt()).isNotNull();
    }
}
