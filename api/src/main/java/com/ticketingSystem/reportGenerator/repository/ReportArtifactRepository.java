package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportArtifact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportArtifactRepository extends JpaRepository<ReportArtifact, Long> {
    Optional<ReportArtifact> findByRequestRequestId(Long requestId);
}
