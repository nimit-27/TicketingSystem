package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.MobileClientProperties;
import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.repository.ClientCredentialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientCredentialSeederTest {

    @Mock
    private ClientCredentialService clientCredentialService;
    @Mock
    private ClientCredentialRepository clientCredentialRepository;

    private MobileClientProperties properties;
    private ClientCredentialSeeder seeder;

    @BeforeEach
    void setUp() {
        properties = new MobileClientProperties();
        properties.setId("mobile-client");
        properties.setSecret("mobile-secret");
        properties.setDescription("Parent app");
        seeder = new ClientCredentialSeeder(properties, clientCredentialService, clientCredentialRepository);
    }

    @Test
    void ensureMobileClientCredentialShouldSkipCreationWhenExistingCredentialFound() {
        when(clientCredentialRepository.findByClientIdAndRevokedAtIsNull("mobile-client"))
                .thenReturn(Optional.of(new ClientCredential()));

        seeder.ensureMobileClientCredential();

        verify(clientCredentialService, never()).registerClient("mobile-client", "mobile-secret", "Parent app");
    }

    @Test
    void ensureMobileClientCredentialShouldCreateMissingCredential() {
        when(clientCredentialRepository.findByClientIdAndRevokedAtIsNull("mobile-client"))
                .thenReturn(Optional.empty());

        seeder.ensureMobileClientCredential();

        // Seeder should bootstrap expected mobile credentials exactly once when absent.
        verify(clientCredentialService).registerClient("mobile-client", "mobile-secret", "Parent app");
    }
}
