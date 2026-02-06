package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.DistrictMaster;
import com.ticketingSystem.api.repository.DistrictMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DistrictMasterService {

    private final DistrictMasterRepository repository;

    public DistrictMasterService(DistrictMasterRepository repository) {
        this.repository = repository;
    }

    public List<DistrictMaster> getAll() {
        return repository.findAll();
    }

    public List<DistrictMaster> getByHrmsRegCode(String hrmsRegCode) {
        return repository.findByHrmsRegCodeOrderByDistrictNameAsc(hrmsRegCode);
    }
}
