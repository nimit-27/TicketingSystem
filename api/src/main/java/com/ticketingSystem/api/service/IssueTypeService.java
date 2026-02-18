package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.IssueType;
import com.ticketingSystem.api.repository.IssueTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IssueTypeService {
    private static final String ACTIVE_FLAG = "1";

    private final IssueTypeRepository repository;

    public IssueTypeService(IssueTypeRepository repository) {
        this.repository = repository;
    }

    public List<IssueType> getAllActive() {
        return repository.findByIsActive(ACTIVE_FLAG);
    }

    public boolean isSlaEnabledForIssueType(String issueTypeId) {
        if (issueTypeId == null || issueTypeId.isBlank()) {
            return false;
        }
        return repository.findById(issueTypeId)
                .map(IssueType::getSlaFlag)
                .orElse(false);
    }
}
