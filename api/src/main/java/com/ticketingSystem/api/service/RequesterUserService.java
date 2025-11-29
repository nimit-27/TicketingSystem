package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.RequesterUserDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RequesterUserService {
    private final RequesterUserRepository requesterUserRepository;

    public RequesterUserService(RequesterUserRepository requesterUserRepository) {
        this.requesterUserRepository = requesterUserRepository;
    }

    public List<RequesterUserDto> getAllRequesterUsers() {
        return requesterUserRepository.findAll().stream()
                .map(DtoMapper::toRequesterUserDto)
                .toList();
    }

    public Optional<RequesterUserDto> getRequesterUser(String userId) {
        return requesterUserRepository.findById(userId)
                .map(DtoMapper::toRequesterUserDto);
    }
}
