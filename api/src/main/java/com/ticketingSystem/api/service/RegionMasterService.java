package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.RegionMaster;
import com.ticketingSystem.api.repository.RegionMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegionMasterService {

    private final RegionMasterRepository repository;

    public RegionMasterService(RegionMasterRepository repository) {
        this.repository = repository;
    }

    public List<RegionMaster> getAll() {
        return repository.findAll();
    }

    public List<RegionMaster> getByZoneCode(String zoneCode) {
        return repository.findByZoneCodeOrderByRegionNameAsc(zoneCode);
    }
}
