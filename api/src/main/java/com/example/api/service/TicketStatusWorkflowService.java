package com.example.api.service;

import com.example.api.models.StatusMaster;
import com.example.api.models.TicketStatusWorkflow;
import com.example.api.repository.StatusMasterRepository;
import com.example.api.repository.TicketStatusWorkflowRepository;
import org.springframework.stereotype.Service;

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

    public List<StatusMaster> getNextStatusesByCurrentStatus(String statusId) {
        Integer id = Integer.valueOf(statusId);
        List<Integer> nextIds = workflowRepository.findByCurrentStatus(id)
                .stream()
                .map(TicketStatusWorkflow::getNextStatus)
                .collect(Collectors.toList());
        return statusMasterRepository.findAllById(
                nextIds.stream().map(Object::toString).collect(Collectors.toList()));
    }

    public List<TicketStatusWorkflow> getAllMappings() {
        return workflowRepository.findAll();
    }

    public String getStatusIdByCode(String statusCode) {
        Optional<StatusMaster> sm = statusMasterRepository.findByStatusCode(statusCode);
        return sm.map(StatusMaster::getStatusId).orElse(null);
    }

    public boolean getSlaFlagByStatusId(String statusId) {
        return statusMasterRepository.findById(statusId)
                .map(StatusMaster::getSlaFlag)
                .orElse(false);
    }
}
