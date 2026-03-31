package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.service.NagiosTicketSlaService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ext/nagios")
public class NagiosMonitoringController {
    private final NagiosTicketSlaService nagiosTicketSlaService;

    public NagiosMonitoringController(NagiosTicketSlaService nagiosTicketSlaService) {
        this.nagiosTicketSlaService = nagiosTicketSlaService;
    }

    @GetMapping("/ticket-sla")
    public NagiosTicketSlaSnapshotDto getTicketSlaSnapshot(Authentication authentication,
                                                           @RequestHeader(value = "X-Nagios-Api-Key", required = false) String apiKey,
                                                           @RequestParam(value = "limit", required = false) Integer limit) {
        return nagiosTicketSlaService.fetchSnapshot(authentication, apiKey, limit);
    }
}
