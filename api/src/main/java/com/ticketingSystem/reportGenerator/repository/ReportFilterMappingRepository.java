package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportFilterMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportFilterMappingRepository extends JpaRepository<ReportFilterMapping, Long> {
    List<ReportFilterMapping> findByReport_ReportIdOrderByDisplayOrderAsc(Long reportId);
}
