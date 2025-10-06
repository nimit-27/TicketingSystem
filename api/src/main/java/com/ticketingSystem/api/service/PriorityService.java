package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.Priority;
import com.ticketingSystem.api.repository.PriorityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriorityService {
    private final PriorityRepository repository;

    public PriorityService(PriorityRepository repository) {
        this.repository = repository;
    }

    public List<Priority> getAll() {
        return repository.findAll();
    }
}
