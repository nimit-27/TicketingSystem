package com.example.api.service;

import com.example.api.dto.StakeholderDto;
import com.example.api.mapper.DtoMapper;
import com.example.api.repository.StakeholderRepository;
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
}
