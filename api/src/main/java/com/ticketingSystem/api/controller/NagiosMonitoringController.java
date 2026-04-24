package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRequestDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryDto;
import com.ticketingSystem.api.service.NagiosTicketSlaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/public/nagios")
public class NagiosMonitoringController {
    private final NagiosTicketSlaService nagiosTicketSlaService;

    public NagiosMonitoringController(NagiosTicketSlaService nagiosTicketSlaService) {
        this.nagiosTicketSlaService = nagiosTicketSlaService;
    }

    @PostMapping("/ticket-sla")
    public NagiosTicketSlaSnapshotDto getTicketSlaSnapshot(@RequestBody(required = false) NagiosTicketSlaRequestDto request) {
        Integer limit = request != null ? request.getLimit() : null;
        return nagiosTicketSlaService.fetchSnapshot(limit);
    }

    @GetMapping("/ticket-sla")
    public NagiosTicketSlaSnapshotDto getTicketSlaSnapshot() {
//        Integer limit = request != null ? request.getLimit() : null;
        return nagiosTicketSlaService.fetchSnapshot(50);
    }

    @GetMapping("/ticket-sla/summary")
    public NagiosTicketSlaSummaryDto getTicketSlaSummary(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return nagiosTicketSlaService.fetchSummary(fromDate, toDate);
    }

    @GetMapping("/ticket-sla/summary-detailed")
    public NagiosTicketSlaSummaryDto getTicketSlaSummaryDetailed(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return nagiosTicketSlaService.fetchSummaryDetailed(fromDate, toDate);
    }
}
