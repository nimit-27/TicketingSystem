package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRequestDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.service.NagiosTicketSlaService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ext/nagios")
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
}
