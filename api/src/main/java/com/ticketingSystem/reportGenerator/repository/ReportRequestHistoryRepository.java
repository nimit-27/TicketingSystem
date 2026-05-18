package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportRequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRequestHistoryRepository extends JpaRepository<ReportRequestHistory, Long> {
    List<ReportRequestHistory> findTop50ByOrderByRequestedAtDesc();
}
