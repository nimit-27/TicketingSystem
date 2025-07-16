package com.example.api.service;

import com.example.api.dto.UserDto;
import com.example.api.dto.LevelDto;
import com.example.api.models.User;
import com.example.api.models.Level;
import com.example.api.repository.LevelRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class LevelService {
    private final LevelRepository levelRepository;

    public LevelService(LevelRepository levelRepository) {
        this.levelRepository = levelRepository;
    }

    public List<LevelDto> getAllLevels() {
        return levelRepository.findAll().stream().map(level -> {
            LevelDto dto = new LevelDto();
            dto.setLevelId(level.getLevelId());
            dto.setLevelName(level.getLevelName());
            return dto;
        }).toList();
    }

    public Optional<Set<UserDto>> getUsersByLevel(String levelId) {
        return levelRepository
                .findById(levelId)
                .map(level -> {
                    Set<UserDto> userDtos = new HashSet<>();
                    for (User user : level.getUsers()) { // This access triggers lazy loading
                        UserDto dto = new UserDto();
                        dto.setUserId(user.getUserId());
                        dto.setUsername(user.getUsername());
                        dto.setName(user.getName());
                        dto.setEmailId(user.getEmailId());
                        dto.setMobileNo(user.getMobileNo());
                        dto.setOffice(user.getOffice());
                        userDtos.add(dto);
                    }
                    return userDtos;
                });
    }
}
