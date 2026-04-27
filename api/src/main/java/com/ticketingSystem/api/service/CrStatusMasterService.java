package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.CrStatusMaster;
import com.ticketingSystem.api.repository.CrStatusMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CrStatusMasterService {

    private final CrStatusMasterRepository crStatusMasterRepository;

    public List<CrStatusMaster> getAllStatuses() {
        return crStatusMasterRepository.findAll();
    }
}
