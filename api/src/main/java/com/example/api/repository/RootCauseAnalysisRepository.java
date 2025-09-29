package com.example.api.repository;

import com.example.api.models.RootCauseAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RootCauseAnalysisRepository extends JpaRepository<RootCauseAnalysis, String> {
    Optional<RootCauseAnalysis> findByTicket_Id(String ticketId);
}
