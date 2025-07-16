package com.example.api.repository;

import com.example.api.models.Severity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeverityRepository extends JpaRepository<Severity, String> {
}
