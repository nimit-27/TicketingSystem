package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatusMasterService {
    private final StatusMasterRepository repository;

    public StatusMasterService(StatusMasterRepository repository) {
        this.repository = repository;
    }

    public List<Status> getAllStatuses() {
        return repository.findAll();
    }
}
