package com.example.api.service;

import com.example.api.models.Status;
import com.example.api.repository.StatusMasterRepository;
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
