package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RequesterUserExternalIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RequesterUserExternalIdentityRepository extends JpaRepository<RequesterUserExternalIdentity, Long> {
    Optional<RequesterUserExternalIdentity> findBySourceSystemAndExternalUserId(String sourceSystem, String externalUserId);
}
