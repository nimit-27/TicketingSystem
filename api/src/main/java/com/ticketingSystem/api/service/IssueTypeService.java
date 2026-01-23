package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.IssueType;
import com.ticketingSystem.api.repository.IssueTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IssueTypeService {
    private final IssueTypeRepository repository;

    public IssueTypeService(IssueTypeRepository repository) {
        this.repository = repository;
    }

    public List<IssueType> getAll() {
        return repository.findAll();
    }
}
