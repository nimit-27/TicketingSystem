package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.ClientCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientCredentialRepository extends JpaRepository<ClientCredential, String> {
    Optional<ClientCredential> findByClientIdAndRevokedAtIsNull(String clientId);
}
