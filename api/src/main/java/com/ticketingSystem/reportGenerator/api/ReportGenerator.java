package com.ticketingSystem.reportGenerator.api;

public interface ReportGenerator {
    byte[] generateReport(ReportContext context) throws Exception;
}
