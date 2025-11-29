package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.ZoneMaster;
import com.ticketingSystem.api.repository.ZoneMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZoneMasterService {

    private final ZoneMasterRepository repository;

    public ZoneMasterService(ZoneMasterRepository repository) {
        this.repository = repository;
    }

    public List<ZoneMaster> getAll() {
        return repository.findAll();
    }
}
