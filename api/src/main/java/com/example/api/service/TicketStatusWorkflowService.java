package com.example.api.service;

import com.example.api.models.Status;
import com.example.api.models.TicketStatusWorkflow;
import com.example.api.repository.StatusMasterRepository;
import com.example.api.repository.TicketStatusWorkflowRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketStatusWorkflowService {
    private final TicketStatusWorkflowRepository workflowRepository;
    private final StatusMasterRepository statusMasterRepository;

    public TicketStatusWorkflowService(TicketStatusWorkflowRepository workflowRepository,
                                       StatusMasterRepository statusMasterRepository) {
        this.workflowRepository = workflowRepository;
        this.statusMasterRepository = statusMasterRepository;
    }

    public List<TicketStatusWorkflow> getNextStatusesByCurrentStatus(String statusId) {
        List<TicketStatusWorkflow> ticketStatusWorkflowList = new ArrayList<>();

        Integer id = Integer.valueOf(statusId);
        Optional<TicketStatusWorkflow> currentTicketStatusWorkflow = workflowRepository.findById(id);

        currentTicketStatusWorkflow.ifPresent(ticketStatusWorkflowList::add);
        ticketStatusWorkflowList.addAll(workflowRepository.findByCurrentStatus(id));
        return ticketStatusWorkflowList;
    }

    public List<TicketStatusWorkflow> getAllMappings() {
        return workflowRepository.findAll();
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
