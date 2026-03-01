package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.DivisionMaster;
import com.ticketingSystem.api.repository.DivisionMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DivisionService {
    private static final String ACTIVE_FLAG = "1";

    private final DivisionMasterRepository divisionMasterRepository;

    public List<DivisionMaster> getAllActive() {
        return divisionMasterRepository.findByIsActive(ACTIVE_FLAG);
    }
}
