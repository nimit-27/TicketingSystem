package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportColumnMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportColumnMappingRepository extends JpaRepository<ReportColumnMapping, Long> {
    List<ReportColumnMapping> findByReport_ReportIdOrderByDisplayOrderAsc(Long reportId);
}
