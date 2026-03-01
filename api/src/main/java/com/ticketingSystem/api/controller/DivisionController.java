package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.DivisionDto;
import com.ticketingSystem.api.models.DivisionMaster;
import com.ticketingSystem.api.service.DivisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/divisions")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class DivisionController {
    private final DivisionService divisionService;

    @GetMapping
    public ResponseEntity<List<DivisionDto>> getDivisions() {
        List<DivisionDto> divisions = divisionService.getAllActive().stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(divisions);
    }

    private DivisionDto toDto(DivisionMaster division) {
        DivisionDto dto = new DivisionDto();
        dto.setDivisionId(division.getDivisionId());
        dto.setDivisionName(division.getDivisionName());
        dto.setDivisionCode(division.getDivisionCode());
        dto.setDescription(division.getDescription());
        dto.setIsActive(division.getIsActive());
        return dto;
    }
}
