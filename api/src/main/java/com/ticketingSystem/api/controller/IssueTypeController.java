package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.IssueTypeDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.IssueType;
import com.ticketingSystem.api.service.IssueTypeService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/issue-types")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class IssueTypeController {

    private final IssueTypeService issueTypeService;

    @GetMapping
    public ResponseEntity<List<IssueTypeDto>> getIssueTypes() {
        List<IssueTypeDto> issueTypes = issueTypeService.getAll().stream()
                .map(DtoMapper::toIssueTypeDto)
                .toList();
        return ResponseEntity.ok(issueTypes);
    }
}
