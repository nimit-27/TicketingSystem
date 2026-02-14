package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TriggerJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TriggerJobRepository extends JpaRepository<TriggerJob, Long> {
    Optional<TriggerJob> findByTriggerJobCode(String triggerJobCode);
}

