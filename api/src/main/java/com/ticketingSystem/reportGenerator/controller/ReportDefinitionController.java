package com.ticketingSystem.reportGenerator.controller;

import com.ticketingSystem.reportGenerator.dto.ReportDefinitionResponse;
import com.ticketingSystem.reportGenerator.service.ReportDefinitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/report-definitions")
@RequiredArgsConstructor
public class ReportDefinitionController {

    private final ReportDefinitionService reportDefinitionService;

    @GetMapping
    public ResponseEntity<List<ReportDefinitionResponse>> getActiveDefinitions() {
        return ResponseEntity.ok(reportDefinitionService.getActiveDefinitions());
    }

    @GetMapping("/{reportCode}")
    public ResponseEntity<ReportDefinitionResponse> getByCode(@PathVariable String reportCode) {
        return ResponseEntity.ok(reportDefinitionService.getDefinitionByCode(reportCode));
    }
}
