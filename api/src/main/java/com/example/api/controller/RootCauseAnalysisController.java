package com.example.api.controller;

import com.example.api.dto.PaginationResponse;
import com.example.api.dto.RootCauseAnalysisDto;
import com.example.api.dto.TicketDto;
import com.example.api.service.RootCauseAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/root-cause-analysis")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class RootCauseAnalysisController {

    private final RootCauseAnalysisService rootCauseAnalysisService;

    @GetMapping("/tickets")
    public ResponseEntity<PaginationResponse<TicketDto>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String username,
            @RequestParam(required = false) List<String> roles) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastModified"));
        PaginationResponse<TicketDto> response = rootCauseAnalysisService.getTicketsForRootCauseAnalysis(username, roles, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<RootCauseAnalysisDto> getRootCauseAnalysis(@PathVariable String ticketId) {
        RootCauseAnalysisDto dto = rootCauseAnalysisService.getRootCauseAnalysis(ticketId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping(value = "/{ticketId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RootCauseAnalysisDto> saveRootCauseAnalysis(
            @PathVariable String ticketId,
            @RequestParam(required = false) String descriptionOfCause,
            @RequestParam(required = false) String resolutionDescription,
            @RequestParam(required = false) String updatedBy,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) throws IOException {
        RootCauseAnalysisDto dto = rootCauseAnalysisService.save(ticketId, descriptionOfCause, resolutionDescription, updatedBy, attachments);
        return ResponseEntity.status(HttpStatus.OK).body(dto);
    }

    @DeleteMapping("/{ticketId}/attachments")
    public ResponseEntity<RootCauseAnalysisDto> deleteAttachment(
            @PathVariable String ticketId,
            @RequestParam String path,
            @RequestParam(required = false) String updatedBy) throws IOException {
        RootCauseAnalysisDto dto = rootCauseAnalysisService.removeAttachment(ticketId, path, updatedBy);
        return ResponseEntity.ok(dto);
    }
}
