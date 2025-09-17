package com.example.api.repository;

import com.example.api.enums.RecommendedSeverityStatus;
import com.example.api.models.RecommendedSeverityFlow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecommendedSeverityFlowRepository extends JpaRepository<RecommendedSeverityFlow, Long> {

    Optional<RecommendedSeverityFlow> findTopByTicket_IdAndRecommendedSeverityOrderByIdDesc(String ticketId, String recommendedSeverity);

    Optional<RecommendedSeverityFlow> findTopByTicket_IdAndRecommendedSeverityStatusOrderByIdDesc(String ticketId, RecommendedSeverityStatus status);

    Optional<RecommendedSeverityFlow> findTopByTicket_IdAndRecommendedSeverityAndRecommendedSeverityStatusOrderByIdDesc(String ticketId, String recommendedSeverity, RecommendedSeverityStatus status);
}
