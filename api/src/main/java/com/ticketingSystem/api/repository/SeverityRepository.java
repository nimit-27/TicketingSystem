package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Severity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeverityRepository extends JpaRepository<Severity, String> {
}
