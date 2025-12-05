package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.MobileClientProperties;
import com.ticketingSystem.api.repository.ClientCredentialRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class ClientCredentialSeeder {
    private final MobileClientProperties mobileClientProperties;
    private final ClientCredentialService clientCredentialService;
    private final ClientCredentialRepository clientCredentialRepository;

    public ClientCredentialSeeder(MobileClientProperties mobileClientProperties,
                                  ClientCredentialService clientCredentialService,
                                  ClientCredentialRepository clientCredentialRepository) {
        this.mobileClientProperties = mobileClientProperties;
        this.clientCredentialService = clientCredentialService;
        this.clientCredentialRepository = clientCredentialRepository;
    }

    @PostConstruct
    public void ensureMobileClientCredential() {
        clientCredentialRepository.findByClientIdAndRevokedAtIsNull(mobileClientProperties.getId())
                .orElseGet(() -> clientCredentialService.registerClient(
                        mobileClientProperties.getId(),
                        mobileClientProperties.getSecret(),
                        mobileClientProperties.getDescription()
                ));
    }
}
