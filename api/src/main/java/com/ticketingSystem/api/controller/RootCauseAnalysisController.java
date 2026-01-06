package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.PaginationResponse;
import com.ticketingSystem.api.dto.RootCauseAnalysisDto;
import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.service.RootCauseAnalysisService;
import com.ticketingSystem.api.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
            @RequestParam(required = false) List<String> roles,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String subCategoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastModified"));
        PaginationResponse<TicketDto> response = rootCauseAnalysisService.getTicketsForRootCauseAnalysis(
                username,
                roles,
                pageable,
                DateTimeUtils.parseToLocalDateTime(fromDate),
                DateTimeUtils.parseToLocalDateTime(toDate),
                categoryId,
                subCategoryId
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<TicketDto> getRCATicketById(@PathVariable String ticketId) {
        TicketDto ticketDto = rootCauseAnalysisService.getTicketForRootCauseAnalysisById(ticketId);
        return ResponseEntity.ok(ticketDto);
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
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {
        RootCauseAnalysisDto dto = rootCauseAnalysisService.save(ticketId, descriptionOfCause, resolutionDescription, updatedBy, attachments);
        return ResponseEntity.status(HttpStatus.OK).body(dto);
    }

    @DeleteMapping("/{ticketId}/attachments")
    public ResponseEntity<RootCauseAnalysisDto> deleteAttachment(
            @PathVariable String ticketId,
            @RequestParam String path,
            @RequestParam(required = false) String updatedBy) {
        RootCauseAnalysisDto dto = rootCauseAnalysisService.removeAttachment(ticketId, path, updatedBy);
        return ResponseEntity.ok(dto);
    }
}
