package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.AccessPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccessPolicyRepository extends JpaRepository<AccessPolicy, Integer> {
    Optional<AccessPolicy> findByCodeIgnoreCase(String code);
    List<AccessPolicy> findByResourceIgnoreCaseAndIsActiveTrue(String resource);
}
