package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.StakeholderDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.repository.StakeholderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StakeholderService {
    private final StakeholderRepository repository;

    public StakeholderService(StakeholderRepository repository) {
        this.repository = repository;
    }

    public List<StakeholderDto> getAll() {
        return repository.findAll().stream()
                .map(DtoMapper::toStakeholderDto)
                .collect(Collectors.toList());
    }

    public List<StakeholderDto> getByStakeholderGroupId(Integer sgId) {
        return repository.findByStakeholderGroupId(sgId).stream()
                .map(DtoMapper::toStakeholderDto)
                .collect(Collectors.toList());
    }
}
