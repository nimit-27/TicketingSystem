package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportFilterMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportFilterMappingRepository extends JpaRepository<ReportFilterMapping, Long> {
    List<ReportFilterMapping> findByReport_ReportIdOrderByDisplayOrderAsc(Long reportId);
}
