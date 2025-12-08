package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.ParameterMaster;
import com.ticketingSystem.api.repository.ParameterMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParameterMasterService {
    private final ParameterMasterRepository repository;

    public ParameterMasterService(ParameterMasterRepository repository) {
        this.repository = repository;
    }

    public List<ParameterMaster> getAll() {
        return repository.findAll();
    }
}
