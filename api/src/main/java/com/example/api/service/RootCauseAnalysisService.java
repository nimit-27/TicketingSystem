package com.example.api.service;

import com.example.api.dto.PaginationResponse;
import com.example.api.dto.RootCauseAnalysisDto;
import com.example.api.dto.TicketDto;
import com.example.api.enums.TicketStatus;
import com.example.api.exception.RootCauseAnalysisNotFoundException;
import com.example.api.exception.RootCauseAnalysisProcessingException;
import com.example.api.exception.TicketNotFoundException;
import com.example.api.models.RootCauseAnalysis;
import com.example.api.models.Severity;
import com.example.api.models.UploadedFile;
import com.example.api.models.Ticket;
import com.example.api.repository.RootCauseAnalysisRepository;
import com.example.api.repository.SeverityRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.repository.UploadedFileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RootCauseAnalysisService {

    private static final Set<String> RCA_SEVERITY_IDS = Set.of("S1", "S2", "S3");
    private static final String RCA_STATUS_NOT_APPLICABLE = "NOT_APPLICABLE";
    private static final String RCA_STATUS_PENDING = "PENDING";
    private static final String RCA_STATUS_SUBMITTED = "SUBMITTED";
    private final RootCauseAnalysisRepository rootCauseAnalysisRepository;
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;
    private final UploadedFileRepository uploadedFileRepository;
    private final RootCauseAnalysisStorageService storageService;
    private final Map<String, String> severityIdToLabel;
    private final Map<String, String> severityIdToDisplay;
    private final Set<String> severityTokens;

    public RootCauseAnalysisService(RootCauseAnalysisRepository rootCauseAnalysisRepository,
                                    TicketRepository ticketRepository,
                                    TicketService ticketService,
                                    SeverityRepository severityRepository,
                                    UploadedFileRepository uploadedFileRepository,
                                    RootCauseAnalysisStorageService storageService) {
        this.rootCauseAnalysisRepository = rootCauseAnalysisRepository;
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
        this.uploadedFileRepository = uploadedFileRepository;
        this.storageService = storageService;
        List<Severity> severities = severityRepository.findAll();
        this.severityIdToLabel = new HashMap<>();
        this.severityIdToDisplay = new HashMap<>();
        this.severityTokens = new HashSet<>();
        if (!CollectionUtils.isEmpty(severities)) {
            for (Severity severity : severities) {
                if (severity == null || severity.getId() == null) {
                    continue;
                }
                String id = severity.getId().trim().toUpperCase(Locale.ROOT);
                String level = Optional.ofNullable(severity.getLevel()).orElse("");
                if (!RCA_SEVERITY_IDS.contains(id)) {
                    continue;
                }
                severityIdToLabel.put(id, level);
                severityIdToDisplay.put(id, extractDisplay(level, id));
                addSeverityTokens(id, level);
            }
        }
        if (severityTokens.isEmpty()) {
            addFallbackSeverityData();
        }
    }

    private void addFallbackSeverityData() {
        Map<String, String> defaults = Map.of(
                "S1", "Critical - S1",
                "S2", "High - S2",
                "S3", "Medium - S3"
        );
        defaults.forEach((id, label) -> {
            severityIdToLabel.putIfAbsent(id, label);
            severityIdToDisplay.putIfAbsent(id, extractDisplay(label, id));
            addSeverityTokens(id, label);
        });
        severityTokens.addAll(defaults.keySet().stream().map(id -> id.toLowerCase(Locale.ROOT)).collect(Collectors.toSet()));
        severityTokens.add("critical");
        severityTokens.add("high");
        severityTokens.add("medium");
    }

    private void addSeverityTokens(String id, String level) {
        String upperId = id.toUpperCase(Locale.ROOT);
        String lowerId = upperId.toLowerCase(Locale.ROOT);
        severityTokens.add(lowerId);
        if (level != null && !level.isBlank()) {
            String lowerLevel = level.toLowerCase(Locale.ROOT);
            severityTokens.add(lowerLevel);
            String display = extractDisplay(level, id);
            if (display != null && !display.isBlank()) {
                severityTokens.add(display.toLowerCase(Locale.ROOT));
            }
        }
    }

    private String extractDisplay(String level, String fallbackId) {
        if (level == null || level.isBlank()) {
            return fallbackId;
        }
        int idx = level.indexOf(' ');
        if (idx > 0) {
            String beforeHyphen = level.split("-", 2)[0].trim();
            if (!beforeHyphen.isBlank()) {
                return beforeHyphen;
            }
        }
        return level;
    }

    public PaginationResponse<TicketDto> getTicketsForRootCauseAnalysis(String username, List<String> roles, Pageable pageable) {
        boolean isTeamLead = isTeamLead(roles);
        String updatedBy = isTeamLead ? null : normalize(username);
        Page<Ticket> tickets = ticketRepository.findClosedTicketsForRootCauseAnalysis(
                TicketStatus.CLOSED,
                severityTokens,
                updatedBy,
                pageable
        );
        Set<String> submittedTicketIds;
        List<Ticket> content = tickets.getContent();
        if (!content.isEmpty()) {
            Set<String> ticketIds = content.stream()
                    .map(Ticket::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            if (!ticketIds.isEmpty()) {
                List<String> rcaTicketIds = rootCauseAnalysisRepository.findTicketIdsWithRca(ticketIds);
                if (rcaTicketIds != null && !rcaTicketIds.isEmpty()) {
                    submittedTicketIds = new HashSet<>(rcaTicketIds);
                } else {
                    submittedTicketIds = Collections.emptySet();
                }
            } else {
                submittedTicketIds = Collections.emptySet();
            }
        } else {
            submittedTicketIds = Collections.emptySet();
        }
        Page<TicketDto> dtoPage = tickets.map(ticket -> {
            TicketDto dto = ticketService.mapWithStatusId(ticket);
            String severityId = resolveSeverityId(ticket.getSeverity());
            if (severityId != null) {
                dto.setSeverityId(severityId);
                dto.setSeverity(resolveSeverityDisplay(severityId));
                dto.setSeverityLabel(resolveSeverityLabel(severityId));
            } else {
                dto.setSeverityId(ticket.getSeverity());
                dto.setSeverity(ticket.getSeverity());
                dto.setSeverityLabel(ticket.getSeverity());
            }
            dto.setRcaStatus(resolveRcaStatus(ticket, submittedTicketIds));
            return dto;
        });
        return new PaginationResponse<>(
                dtoPage.getContent(),
                dtoPage.getNumber(),
                dtoPage.getSize(),
                dtoPage.getTotalElements(),
                dtoPage.getTotalPages()
        );
    }

    public TicketDto getTicketForRootCauseAnalysisById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (!isEligibleForRootCauseAnalysis(ticket)) {
            throw new RootCauseAnalysisNotFoundException(ticketId);
        }

        Optional<RootCauseAnalysis> rca = rootCauseAnalysisRepository.findByTicket_Id(ticketId);

        TicketDto ticketDto = ticketService.mapWithStatusId(ticket);
        String severityId = resolveSeverityId(ticket.getSeverity());
        if (severityId != null) {
            ticketDto.setSeverityId(severityId);
            ticketDto.setSeverity(resolveSeverityDisplay(severityId));
            ticketDto.setSeverityLabel(resolveSeverityLabel(severityId));
        }
        ticketDto.setRcaStatus(rca.isPresent() ? RCA_STATUS_SUBMITTED : RCA_STATUS_PENDING);
        return ticketDto;
    }

    public RootCauseAnalysisDto getRootCauseAnalysis(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        RootCauseAnalysis rca = rootCauseAnalysisRepository.findByTicket_Id(ticketId)
                .orElseThrow(() -> new RootCauseAnalysisNotFoundException(ticketId));
        return toDto(rca, ticket);
    }

    public RootCauseAnalysisDto save(String ticketId,
                                     String descriptionOfCause,
                                     String resolutionDescription,
                                     String updatedBy,
                                     MultipartFile[] attachments) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        try {
            RootCauseAnalysis rca = rootCauseAnalysisRepository.findByTicket_Id(ticketId)
                    .orElseGet(() -> initializeRecord(ticket));
            rca.setDescriptionOfCause(descriptionOfCause);
            rca.setResolutionDescription(resolutionDescription);
            String severityId = resolveSeverityId(ticket.getSeverity());
            rca.setSeverityId(severityId != null ? severityId : ticket.getSeverity());
            if (updatedBy != null && !updatedBy.isBlank()) {
                if (rca.getCreatedBy() == null || rca.getCreatedBy().isBlank()) {
                    rca.setCreatedBy(updatedBy);
                }
                rca.setUpdatedBy(updatedBy);
            }
            List<String> existingAttachments = new ArrayList<>(parseAttachments(rca.getAttachmentPaths()));
            if (attachments != null) {
                for (MultipartFile file : attachments) {
                    if (file == null || file.isEmpty()) {
                        continue;
                    }
                    String path = storageService.save(file, ticketId);
                    existingAttachments.add(path);
                    persistUploadedFile(ticket, file, path, updatedBy);
                }
            }
            rca.setAttachmentPaths(joinAttachments(existingAttachments));
            RootCauseAnalysis saved = rootCauseAnalysisRepository.save(rca);
            return toDto(saved, ticket);
        } catch (IOException | RuntimeException ex) {
            throw new RootCauseAnalysisProcessingException(ticketId, ex);
        }
    }

    public RootCauseAnalysisDto removeAttachment(String ticketId, String relativePath, String updatedBy) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        RootCauseAnalysis rca = rootCauseAnalysisRepository.findByTicket_Id(ticketId)
                .orElseThrow(() -> new RootCauseAnalysisNotFoundException(ticketId));
        try {
            List<String> attachments = new ArrayList<>(parseAttachments(rca.getAttachmentPaths()));
            boolean removed = attachments.removeIf(path -> path.equals(relativePath));
            if (removed) {
                storageService.delete(relativePath);
                uploadedFileRepository.findByTicket_IdAndRelativePath(ticketId, relativePath)
                        .ifPresent(uploadedFile -> {
                            uploadedFile.setIsActive("N");
                            if (updatedBy != null && !updatedBy.isBlank()) {
                                uploadedFile.setUploadedBy(updatedBy);
                            }
                            uploadedFileRepository.save(uploadedFile);
                        });
            }
            if (updatedBy != null && !updatedBy.isBlank()) {
                rca.setUpdatedBy(updatedBy);
            }
            rca.setAttachmentPaths(joinAttachments(attachments));
            RootCauseAnalysis saved = rootCauseAnalysisRepository.save(rca);
            return toDto(saved, ticket);
        } catch (IOException | RuntimeException ex) {
            throw new RootCauseAnalysisProcessingException(ticketId, ex);
        }
    }

    private void persistUploadedFile(Ticket ticket, MultipartFile file, String relativePath, String uploadedBy) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        uploadedFileRepository.findByTicket_IdAndRelativePath(ticket.getId(), relativePath)
                .ifPresentOrElse(existing -> {
                    existing.setIsActive("Y");
                    if (uploadedBy != null && !uploadedBy.isBlank()) {
                        existing.setUploadedBy(uploadedBy);
                    }
                    uploadedFileRepository.save(existing);
                }, () -> {
                    UploadedFile uploadedFile = new UploadedFile();
                    String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse(relativePath);
                    uploadedFile.setFileName(originalName);
                    String extension = StringUtils.getFilenameExtension(originalName);
                    if (extension != null && !extension.isBlank()) {
                        uploadedFile.setFileExtension(extension);
                    }
                    uploadedFile.setRelativePath(relativePath);
                    uploadedFile.setUploadedBy(uploadedBy);
                    uploadedFile.setTicket(ticket);
                    uploadedFile.setIsActive("Y");
                    uploadedFileRepository.save(uploadedFile);
                });
    }

    private RootCauseAnalysis initializeRecord(Ticket ticket) {
        RootCauseAnalysis rca = new RootCauseAnalysis();
        rca.setTicket(ticket);
        String severityId = resolveSeverityId(ticket.getSeverity());
        rca.setSeverityId(severityId != null ? severityId : ticket.getSeverity());
        return rootCauseAnalysisRepository.save(rca);
    }

    private RootCauseAnalysisDto toDto(RootCauseAnalysis rca, Ticket ticket) {
        RootCauseAnalysisDto dto = new RootCauseAnalysisDto();
        dto.setTicketId(ticket.getId());
        String severityId = resolveSeverityId(rca.getSeverityId() != null ? rca.getSeverityId() : ticket.getSeverity());
        if (severityId != null) {
            dto.setSeverityId(severityId);
            dto.setSeverityLabel(resolveSeverityLabel(severityId));
            dto.setSeverityDisplay(resolveSeverityDisplay(severityId));
        } else {
            String raw = rca.getSeverityId() != null ? rca.getSeverityId() : ticket.getSeverity();
            dto.setSeverityId(raw);
            dto.setSeverityLabel(raw);
            dto.setSeverityDisplay(raw);
        }
        dto.setDescriptionOfCause(rca.getDescriptionOfCause());
        dto.setResolutionDescription(rca.getResolutionDescription());
        dto.setAttachments(parseAttachments(rca.getAttachmentPaths()));
        dto.setUpdatedBy(rca.getUpdatedBy());
        dto.setUpdatedAt(rca.getUpdatedAt());
        return dto;
    }

    private List<String> parseAttachments(String attachments) {
        if (attachments == null || attachments.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(attachments.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String resolveRcaStatus(Ticket ticket, Set<String> submittedTicketIds) {
        if (ticket == null || ticket.getId() == null) {
            return RCA_STATUS_NOT_APPLICABLE;
        }
        if (ticket.getTicketStatus() != TicketStatus.CLOSED) {
            return RCA_STATUS_NOT_APPLICABLE;
        }
        String severityId = resolveSeverityId(ticket.getSeverity());
        if (severityId == null || !RCA_SEVERITY_IDS.contains(severityId)) {
            return RCA_STATUS_NOT_APPLICABLE;
        }
        return submittedTicketIds.contains(ticket.getId()) ? RCA_STATUS_SUBMITTED : RCA_STATUS_PENDING;
    }

    private String joinAttachments(List<String> attachments) {
        return attachments == null || attachments.isEmpty()
                ? null
                : attachments.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.joining(","));
    }

    private String resolveSeverityId(String severityValue) {
        if (severityValue == null || severityValue.isBlank()) {
            return null;
        }
        String normalized = severityValue.trim().toUpperCase(Locale.ROOT);
        if (RCA_SEVERITY_IDS.contains(normalized)) {
            return normalized;
        }
        for (String id : RCA_SEVERITY_IDS) {
            String label = severityIdToLabel.get(id);
            if (label != null && normalized.equals(label.toUpperCase(Locale.ROOT))) {
                return id;
            }
            String display = severityIdToDisplay.get(id);
            if (display != null && normalized.equals(display.toUpperCase(Locale.ROOT))) {
                return id;
            }
        }
        if (normalized.contains("CRITICAL")) {
            return "S1";
        }
        if (normalized.contains("HIGH")) {
            return "S2";
        }
        if (normalized.contains("MEDIUM")) {
            return "S3";
        }
        return null;
    }

    private String resolveSeverityLabel(String severityId) {
        if (severityId == null) {
            return null;
        }
        return severityIdToLabel.getOrDefault(severityId.toUpperCase(Locale.ROOT), severityId);
    }

    private String resolveSeverityDisplay(String severityId) {
        if (severityId == null) {
            return null;
        }
        return severityIdToDisplay.getOrDefault(severityId.toUpperCase(Locale.ROOT), severityId);
    }

    private boolean isEligibleForRootCauseAnalysis(Ticket ticket) {
        if (ticket == null) {
            return false;
        }
        if (ticket.getTicketStatus() != TicketStatus.CLOSED) {
            return false;
        }
        String severityId = resolveSeverityId(ticket.getSeverity());
        return severityId != null && RCA_SEVERITY_IDS.contains(severityId);
    }

    private boolean isTeamLead(List<String> roles) {
        if (roles == null) {
            return false;
        }
        return roles.stream()
                .filter(Objects::nonNull)
                .map(role -> role.trim().toUpperCase(Locale.ROOT))
                .anyMatch(role -> role.equals("TEAM_LEAD") || role.equals("TL") || role.equals("TEAMLEAD"));
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
