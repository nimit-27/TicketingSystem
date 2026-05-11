package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TicketCrCreateRequestDto;
import com.ticketingSystem.api.dto.TicketCrDto;
import com.ticketingSystem.api.dto.TicketCrHistoryDto;
import com.ticketingSystem.api.dto.TicketCrStatusWorkflowDto;
import com.ticketingSystem.api.dto.TicketCrUpdateStatusRequestDto;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.*;
import com.ticketingSystem.api.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketCrService {

    private final TicketCrRepository ticketCrRepository;
    private final TicketRepository ticketRepository;
    private final StatusMasterRepository statusMasterRepository;
    private final CrStatusMasterRepository crStatusMasterRepository;
    private final TicketCrIdGenerator ticketCrIdGenerator;
    private final TicketCrStatusWorkflowRepository ticketCrStatusWorkflowRepository;
    private final RoleRepository roleRepository;
    private final TicketCrHistoryRepository ticketCrHistoryRepository;
    private final TicketCrHistoryConfigRepository ticketCrHistoryConfigRepository;
    private final TicketStatusWorkflowService ticketStatusWorkflowService;
    private final StatusHistoryService statusHistoryService;

    public TicketCrDto create(TicketCrCreateRequestDto request) { /* unchanged */
        Ticket ticket = ticketRepository.findById(request.getTicketId()).orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + request.getTicketId()));
        Status status = statusMasterRepository.findById(request.getStatusId()).orElseThrow(() -> new EntityNotFoundException("Status not found: " + request.getStatusId()));
        CrStatusMaster crStatus = crStatusMasterRepository.findById(request.getCrStatusId()).orElseThrow(() -> new EntityNotFoundException("CR status not found: " + request.getCrStatusId()));
        TicketCr ticketCr = new TicketCr();
        ticketCr.setTicketCrId(ticketCrIdGenerator.generateTicketCrId());
        ticketCr.setTicket(ticket); ticketCr.setStatus(status); ticketCr.setCrStatus(crStatus);
        ticketCr.setSubject(request.getSubject()); ticketCr.setDescription(request.getDescription());
        ticketCr.setRequestedBy(request.getRequestedBy()); ticketCr.setAssignedTo(request.getAssignedTo()); ticketCr.setAssignedBy(request.getAssignedBy());
        ticketCr.setRemarks(request.getRemarks()); ticketCr.setCreatedBy(request.getCreatedBy()); ticketCr.setUpdatedBy(request.getUpdatedBy());
        return toDto(ticketCrRepository.save(ticketCr));
    }

    public TicketCrDto getById(String ticketCrId) { return toDto(ticketCrRepository.findById(ticketCrId).orElseThrow(() -> new EntityNotFoundException("Ticket CR not found: " + ticketCrId))); }
    public List<TicketCrDto> getAll() { return ticketCrRepository.findAll().stream().map(this::toDto).toList(); }

    public List<TicketCrStatusWorkflowDto> getAvailableActions(String currentCrStatusId) {
        return ticketCrStatusWorkflowRepository.findByCurrentStatus_CrStatusIdAndActiveTrue(currentCrStatusId).stream().map(workflow -> {
            TicketCrStatusWorkflowDto dto = new TicketCrStatusWorkflowDto();
            dto.setCrswId(workflow.getId()); dto.setAction(workflow.getAction()); dto.setCurrentStatusId(workflow.getCurrentStatus().getCrStatusId()); dto.setNextStatusId(workflow.getNextStatus().getCrStatusId());
            return dto;
        }).toList();
    }

    public Map<String, List<TicketCrStatusWorkflowDto>> getMappingsByRoles(List<Integer> roles) {
        Set<String> ids = new HashSet<>(); if (roles == null || roles.isEmpty()) return Map.of();
        for (Role role : roleRepository.findAllById(roles)) { String allowed = role.getAllowedCrStatusActionIds(); if (allowed != null && !allowed.isBlank()) for (String s : allowed.split("\\|")) if (!s.isBlank()) ids.add(s.trim()); }
        return ticketCrStatusWorkflowRepository.findAllById(ids).stream().map(workflow -> {
            TicketCrStatusWorkflowDto dto = new TicketCrStatusWorkflowDto();
            dto.setCrswId(workflow.getId()); dto.setAction(workflow.getAction()); dto.setCurrentStatusId(workflow.getCurrentStatus().getCrStatusId()); dto.setNextStatusId(workflow.getNextStatus().getCrStatusId());
            return dto;
        }).collect(Collectors.groupingBy(TicketCrStatusWorkflowDto::getCurrentStatusId));
    }

    public TicketCrDto updateStatus(String ticketCrId, TicketCrUpdateStatusRequestDto request) {
        TicketCr ticketCr = ticketCrRepository.findById(ticketCrId).orElseThrow(() -> new EntityNotFoundException("Ticket CR not found: " + ticketCrId));
        var workflow = ticketCrStatusWorkflowRepository.findById(request.getCrswId()).orElseThrow(() -> new EntityNotFoundException("Ticket CR workflow not found: " + request.getCrswId()));
        if (!workflow.getCurrentStatus().getCrStatusId().equals(ticketCr.getCrStatus().getCrStatusId())) throw new IllegalArgumentException("Invalid workflow for current CR status");

        TicketCr oldRecord = new TicketCr();
        oldRecord.setSubject(ticketCr.getSubject()); oldRecord.setDescription(ticketCr.getDescription()); oldRecord.setStatus(ticketCr.getStatus()); oldRecord.setCrStatus(ticketCr.getCrStatus());
        oldRecord.setRequestedBy(ticketCr.getRequestedBy()); oldRecord.setAssignedTo(ticketCr.getAssignedTo()); oldRecord.setAssignedBy(ticketCr.getAssignedBy()); oldRecord.setRemarks(ticketCr.getRemarks());

        ticketCr.setCrStatus(workflow.getNextStatus()); ticketCr.setRemarks(request.getRemarks()); ticketCr.setUpdatedBy(request.getUpdatedBy());
        syncTicketStatusOnCrRejection(ticketCr, request.getUpdatedBy(), request.getRemarks());
        TicketCr saved = ticketCrRepository.save(ticketCr);
        createHistoryEntries(oldRecord, saved, request.getUpdatedBy());
        return toDto(saved);
    }

    private void syncTicketStatusOnCrRejection(TicketCr ticketCr, String updatedBy, String remark) {
        if (ticketCr.getCrStatus() == null || !"CR_REJECTED".equalsIgnoreCase(ticketCr.getCrStatus().getCrStatusCode())) {
            return;
        }

        Status closedStatus = statusMasterRepository.findByStatusCode(TicketStatus.CLOSED.name());
        if (closedStatus == null) {
            throw new EntityNotFoundException("Status not found for code: " + TicketStatus.CLOSED.name());
        }

        ticketCr.setStatus(closedStatus);

        Ticket ticket = ticketCr.getTicket();
        if (ticket == null) {
            return;
        }

        String previousStatusId = ticket.getStatus() != null
                ? ticket.getStatus().getStatusId()
                : (ticket.getTicketStatus() != null ? ticketStatusWorkflowService.getStatusIdByCode(ticket.getTicketStatus().name()) : null);

        ticket.setTicketStatus(TicketStatus.CLOSED);
        ticket.setStatus(closedStatus);
        ticket.setUpdatedBy(updatedBy);
        ticketRepository.save(ticket);

        String closedStatusId = closedStatus.getStatusId();
        statusHistoryService.addHistory(
                ticket.getId(),
                updatedBy,
                previousStatusId,
                closedStatusId,
                null,
                "Auto-closed due to CR rejection"
        );
    }

    public List<TicketCrHistoryDto> getHistoryByTicketCrId(String ticketCrId, String changeTypeCode) {
        List<TicketCrHistory> history = (changeTypeCode == null || changeTypeCode.isBlank()) ? ticketCrHistoryRepository.findByTicketCrIdOrderByChangedOnDesc(ticketCrId) : ticketCrHistoryRepository.findByTicketCrIdAndChangeTypeCodeOrderByChangedOnDesc(ticketCrId, changeTypeCode);
        return history.stream().map(this::toHistoryDto).toList();
    }

    private void createHistoryEntries(TicketCr oldRecord, TicketCr newRecord, String changedBy) {
        List<TicketCrHistoryConfig> configs = ticketCrHistoryConfigRepository.findByTableNameAndIsTrackableTrueOrderByDisplayOrderAsc("ticket_cr");
        List<TicketCrHistory> rows = new ArrayList<>(); String groupId = UUID.randomUUID().toString();
        for (TicketCrHistoryConfig config : configs) {
            String oldValue = getColumnValue(oldRecord, config.getColumnName()); String newValue = getColumnValue(newRecord, config.getColumnName());
            if (Objects.equals(oldValue, newValue)) continue;
            TicketCrHistory row = new TicketCrHistory(); row.setChangeGroupId(groupId); row.setTicketCrId(newRecord.getTicketCrId()); row.setTicketId(newRecord.getTicket().getId()); row.setColumnName(config.getColumnName()); row.setChangeTypeCode(config.getChangeTypeCode()); row.setDisplayLabel(config.getDisplayLabel()); row.setOldValue(oldValue); row.setNewValue(newValue); row.setChangedBy((changedBy == null || changedBy.isBlank()) ? newRecord.getUpdatedBy() : changedBy); row.setRemarks(newRecord.getRemarks()); rows.add(row);
        }
        if (!rows.isEmpty()) ticketCrHistoryRepository.saveAll(rows);
    }

    private String getColumnValue(TicketCr record, String col) {
        return switch (col) {
            case "subject" -> record.getSubject();
            case "description" -> record.getDescription();
            case "status_id" -> record.getStatus() == null ? null : record.getStatus().getStatusName();
            case "cr_status_id" -> record.getCrStatus() == null ? null : record.getCrStatus().getCrStatusName();
            case "requested_by" -> record.getRequestedBy();
            case "assigned_to" -> record.getAssignedTo();
            case "assigned_by" -> record.getAssignedBy();
            case "remarks" -> record.getRemarks();
            default -> null;
        };
    }

    private TicketCrHistoryDto toHistoryDto(TicketCrHistory h) { TicketCrHistoryDto d = new TicketCrHistoryDto(); d.setHistoryId(h.getHistoryId()); d.setChangeGroupId(h.getChangeGroupId()); d.setTicketCrId(h.getTicketCrId()); d.setTicketId(h.getTicketId()); d.setColumnName(h.getColumnName()); d.setChangeTypeCode(h.getChangeTypeCode()); d.setDisplayLabel(h.getDisplayLabel()); d.setOldValue(h.getOldValue()); d.setNewValue(h.getNewValue()); d.setChangedBy(h.getChangedBy()); d.setChangedOn(h.getChangedOn()); d.setRemarks(h.getRemarks()); return d; }

    private TicketCrDto toDto(TicketCr ticketCr) {
        TicketCrDto dto = new TicketCrDto(); dto.setTicketCrId(ticketCr.getTicketCrId()); dto.setTicketId(ticketCr.getTicket() != null ? ticketCr.getTicket().getId() : null);
        if (ticketCr.getStatus() != null) { dto.setStatusId(ticketCr.getStatus().getStatusId()); dto.setStatusName(ticketCr.getStatus().getStatusName()); dto.setStatusCode(ticketCr.getStatus().getStatusCode()); }
        if (ticketCr.getCrStatus() != null) { dto.setCrStatusId(ticketCr.getCrStatus().getCrStatusId()); dto.setCrStatusName(ticketCr.getCrStatus().getCrStatusName()); dto.setCrStatusCode(ticketCr.getCrStatus().getCrStatusCode()); dto.setColor(ticketCr.getCrStatus().getColor()); }
        dto.setSubject(ticketCr.getSubject()); dto.setDescription(ticketCr.getDescription()); dto.setRequestedBy(ticketCr.getRequestedBy()); dto.setAssignedTo(ticketCr.getAssignedTo()); dto.setAssignedBy(ticketCr.getAssignedBy()); dto.setRemarks(ticketCr.getRemarks()); dto.setCreatedDate(ticketCr.getCreatedDate()); dto.setCreatedBy(ticketCr.getCreatedBy()); dto.setUpdatedOn(ticketCr.getUpdatedOn()); dto.setUpdatedBy(ticketCr.getUpdatedBy()); return dto;
    }
}
