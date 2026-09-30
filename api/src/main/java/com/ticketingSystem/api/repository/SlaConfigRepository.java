package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.SlaConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SlaConfigRepository extends JpaRepository<SlaConfig, String> {
    Optional<SlaConfig> findBySeverityLevel(String severityLevel);

    @Query("SELECT COALESCE(MAX(config.resolutionMinutes), 0) FROM SlaConfig config")
    Long findMaxResolutionMinutes();
}
