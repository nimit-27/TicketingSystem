package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.Severity;
import com.ticketingSystem.api.repository.SeverityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeverityService {
    private final SeverityRepository repository;

    public SeverityService(SeverityRepository repository) {
        this.repository = repository;
    }

    public List<Severity> getAll() {
        return repository.findAll();
    }
}
