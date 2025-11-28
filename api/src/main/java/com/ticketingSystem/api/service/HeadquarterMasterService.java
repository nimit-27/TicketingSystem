package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.HeadquarterMaster;
import com.ticketingSystem.api.repository.HeadquarterMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HeadquarterMasterService {

    private final HeadquarterMasterRepository repository;

    public HeadquarterMasterService(HeadquarterMasterRepository repository) {
        this.repository = repository;
    }

    public List<HeadquarterMaster> getAll() {
        return repository.findAll();
    }
}
