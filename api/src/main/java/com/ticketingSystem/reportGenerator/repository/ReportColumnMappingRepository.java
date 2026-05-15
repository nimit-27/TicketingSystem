package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportColumnMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportColumnMappingRepository extends JpaRepository<ReportColumnMapping, Long> {
    List<ReportColumnMapping> findByReport_ReportIdOrderByDisplayOrderAsc(Long reportId);
}
