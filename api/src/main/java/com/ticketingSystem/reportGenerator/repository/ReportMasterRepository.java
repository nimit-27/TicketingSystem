package com.ticketingSystem.reportGenerator.repository;

import com.ticketingSystem.reportGenerator.models.ReportMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportMasterRepository extends JpaRepository<ReportMaster, Long> {
    Optional<ReportMaster> findByReportCodeAndActiveTrue(String reportCode);
}
