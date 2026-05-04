package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TicketCrCreateRequestDto;
import com.ticketingSystem.api.dto.TicketCrDto;
import com.ticketingSystem.api.dto.TicketCrStatusWorkflowDto;
import com.ticketingSystem.api.dto.TicketCrUpdateStatusRequestDto;
import com.ticketingSystem.api.models.CrStatusMaster;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketCr;
import com.ticketingSystem.api.models.TicketCrHistory;
import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.repository.CrStatusMasterRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.TicketCrRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.TicketCrStatusWorkflowRepository;
import com.ticketingSystem.api.repository.TicketCrHistoryRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final TicketCrHistoryRepository ticketCrHistoryRepository;
    private final RoleRepository roleRepository;

    public TicketCrDto create(TicketCrCreateRequestDto request) {
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + request.getTicketId()));

        Status status = statusMasterRepository.findById(request.getStatusId())
                .orElseThrow(() -> new EntityNotFoundException("Status not found: " + request.getStatusId()));

        CrStatusMaster crStatus = crStatusMasterRepository.findById(request.getCrStatusId())
                .orElseThrow(() -> new EntityNotFoundException("CR status not found: " + request.getCrStatusId()));

        TicketCr ticketCr = new TicketCr();
        ticketCr.setTicketCrId(ticketCrIdGenerator.generateTicketCrId());
        ticketCr.setTicket(ticket);
        ticketCr.setStatus(status);
        ticketCr.setCrStatus(crStatus);
        ticketCr.setSubject(request.getSubject());
        ticketCr.setDescription(request.getDescription());
        ticketCr.setRequestedBy(request.getRequestedBy());
        ticketCr.setAssignedTo(request.getAssignedTo());
        ticketCr.setAssignedBy(request.getAssignedBy());
        ticketCr.setRemarks(request.getRemarks());
        ticketCr.setCreatedBy(request.getCreatedBy());
        ticketCr.setUpdatedBy(request.getUpdatedBy());

        return toDto(ticketCrRepository.save(ticketCr));
    }

    public TicketCrDto getById(String ticketCrId) {
        TicketCr ticketCr = ticketCrRepository.findById(ticketCrId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket CR not found: " + ticketCrId));
        return toDto(ticketCr);
    }

    public List<TicketCrDto> getAll() {
        return ticketCrRepository.findAll().stream().map(this::toDto).toList();
    }


    public List<TicketCrStatusWorkflowDto> getAvailableActions(String currentCrStatusId) {
        return ticketCrStatusWorkflowRepository.findByCurrentStatus_CrStatusIdAndActiveTrue(currentCrStatusId)
                .stream()
                .map(workflow -> {
                    TicketCrStatusWorkflowDto dto = new TicketCrStatusWorkflowDto();
                    dto.setCrswId(workflow.getId());
                    dto.setAction(workflow.getAction());
                    dto.setCurrentStatusId(workflow.getCurrentStatus().getCrStatusId());
                    dto.setNextStatusId(workflow.getNextStatus().getCrStatusId());
                    return dto;
                })
                .toList();
    }



    public Map<String, List<TicketCrStatusWorkflowDto>> getMappingsByRoles(List<Integer> roles) {
        Set<String> ids = new HashSet<>();
        if (roles == null || roles.isEmpty()) {
            return Map.of();
        }

        for (Role role : roleRepository.findAllById(roles)) {
            String allowed = role.getAllowedCrStatusActionIds();
            if (allowed != null && !allowed.isBlank()) {
                for (String s : allowed.split("\\|")) {
                    if (!s.isBlank()) {
                        ids.add(s.trim());
                    }
                }
            }
        }

        return ticketCrStatusWorkflowRepository.findAllById(ids).stream()
                .map(workflow -> {
                    TicketCrStatusWorkflowDto dto = new TicketCrStatusWorkflowDto();
                    dto.setCrswId(workflow.getId());
                    dto.setAction(workflow.getAction());
                    dto.setCurrentStatusId(workflow.getCurrentStatus().getCrStatusId());
                    dto.setNextStatusId(workflow.getNextStatus().getCrStatusId());
                    return dto;
                })
                .collect(Collectors.groupingBy(TicketCrStatusWorkflowDto::getCurrentStatusId));
    }
    public TicketCrDto updateStatus(String ticketCrId, TicketCrUpdateStatusRequestDto request) {
        TicketCr ticketCr = ticketCrRepository.findById(ticketCrId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket CR not found: " + ticketCrId));

        var workflow = ticketCrStatusWorkflowRepository.findById(request.getCrswId())
                .orElseThrow(() -> new EntityNotFoundException("Ticket CR workflow not found: " + request.getCrswId()));

        if (!workflow.getCurrentStatus().getCrStatusId().equals(ticketCr.getCrStatus().getCrStatusId())) {
            throw new IllegalArgumentException("Invalid workflow for current CR status");
        }

        CrStatusMaster previousStatus = ticketCr.getCrStatus();

        ticketCr.setCrStatus(workflow.getNextStatus());
        ticketCr.setRemarks(request.getRemarks());
        ticketCr.setUpdatedBy(request.getUpdatedBy());

        TicketCr saved = ticketCrRepository.save(ticketCr);

        TicketCrHistory history = new TicketCrHistory();
        history.setTicketCr(saved);
        history.setPreviousCrStatus(previousStatus);
        history.setCurrentCrStatus(saved.getCrStatus());
        history.setRemarks(request.getRemarks());
        history.setUpdatedBy(request.getUpdatedBy() != null && !request.getUpdatedBy().isBlank() ? request.getUpdatedBy() : "SYSTEM");
        ticketCrHistoryRepository.save(history);

        return toDto(saved);
    }

    private TicketCrDto toDto(TicketCr ticketCr) {
        TicketCrDto dto = new TicketCrDto();
        dto.setTicketCrId(ticketCr.getTicketCrId());
        dto.setTicketId(ticketCr.getTicket() != null ? ticketCr.getTicket().getId() : null);

        if (ticketCr.getStatus() != null) {
            dto.setStatusId(ticketCr.getStatus().getStatusId());
            dto.setStatusName(ticketCr.getStatus().getStatusName());
            dto.setStatusCode(ticketCr.getStatus().getStatusCode());
        }

        if (ticketCr.getCrStatus() != null) {
            dto.setCrStatusId(ticketCr.getCrStatus().getCrStatusId());
            dto.setCrStatusName(ticketCr.getCrStatus().getCrStatusName());
            dto.setCrStatusCode(ticketCr.getCrStatus().getCrStatusCode());
        }

        dto.setSubject(ticketCr.getSubject());
        dto.setDescription(ticketCr.getDescription());
        dto.setRequestedBy(ticketCr.getRequestedBy());
        dto.setAssignedTo(ticketCr.getAssignedTo());
        dto.setAssignedBy(ticketCr.getAssignedBy());
        dto.setRemarks(ticketCr.getRemarks());
        dto.setCreatedDate(ticketCr.getCreatedDate());
        dto.setCreatedBy(ticketCr.getCreatedBy());
        dto.setUpdatedOn(ticketCr.getUpdatedOn());
        dto.setUpdatedBy(ticketCr.getUpdatedBy());
        return dto;
    }
}
