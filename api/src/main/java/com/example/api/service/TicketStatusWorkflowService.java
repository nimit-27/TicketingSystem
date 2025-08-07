package com.example.api.service;

import com.example.api.models.Status;
import com.example.api.models.TicketStatusWorkflow;
import com.example.api.models.Role;
import com.example.api.repository.StatusMasterRepository;
import com.example.api.repository.TicketStatusWorkflowRepository;
import com.example.api.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TicketStatusWorkflowService {
    private final TicketStatusWorkflowRepository workflowRepository;
    private final StatusMasterRepository statusMasterRepository;
    private final RoleRepository roleRepository;

    public TicketStatusWorkflowService(TicketStatusWorkflowRepository workflowRepository,
                                       StatusMasterRepository statusMasterRepository,
                                       RoleRepository roleRepository) {
        this.workflowRepository = workflowRepository;
        this.statusMasterRepository = statusMasterRepository;
        this.roleRepository = roleRepository;
    }

    public List<TicketStatusWorkflow> getNextStatusesByCurrentStatus(String statusId) {
        List<TicketStatusWorkflow> ticketStatusWorkflowList = new ArrayList<>();

        Integer id = Integer.valueOf(statusId);
        Optional<TicketStatusWorkflow> currentTicketStatusWorkflow = workflowRepository.findById(id);

        currentTicketStatusWorkflow.ifPresent(ticketStatusWorkflowList::add);
        ticketStatusWorkflowList.addAll(workflowRepository.findByCurrentStatus(id));
        return ticketStatusWorkflowList;
    }

    public Map<String, List<TicketStatusWorkflow>> getAllMappings() {
        return workflowRepository.findAll().stream()
                .collect(Collectors.groupingBy(tsw -> String.valueOf(tsw.getCurrentStatus())));
    }

    public Map<String, List<TicketStatusWorkflow>> getMappingsByRoles(List<String> roles) {
        Set<Integer> ids = new HashSet<>();
        if (roles == null || roles.isEmpty()) {
            return Map.of();
        }
        for (Role role : roleRepository.findAllById(roles)) {
            String allowed = role.getAllowedStatusActionIds();
            if (allowed != null && !allowed.isBlank()) {
                for (String s : allowed.split("\\|")) {
                    if (!s.isBlank()) {
                        try {
                            ids.add(Integer.parseInt(s.trim()));
                        } catch (NumberFormatException ignored) {
                        }
                    }
                }
            }
        }
        List<TicketStatusWorkflow> workflows = workflowRepository.findAllById(ids);
        return workflows.stream()
                .collect(Collectors.groupingBy(tsw -> String.valueOf(tsw.getCurrentStatus())));
    }

    public String getStatusIdByCode(String statusCode) {
        Optional<Status> sm = Optional.ofNullable(statusMasterRepository.findByStatusCode(statusCode));
        return sm.map(Status::getStatusId).orElse(null);
    }

    public boolean getSlaFlagByStatusId(String statusId) {
        return statusMasterRepository.findById(statusId)
                .map(Status::getSlaFlag)
                .orElse(false);
    }

    public String getStatusCodeById(String statusId) {
        return statusMasterRepository.findById(statusId)
                .map(Status::getStatusCode)
                .orElse(null);
    }
}
