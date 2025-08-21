package com.example.api.service;

import com.example.api.dto.UserDto;
import com.example.api.dto.LevelDto;
import com.example.api.models.Level;
import com.example.api.models.UserLevel;
import com.example.api.mapper.DtoMapper;
import com.example.api.repository.LevelRepository;
import com.example.api.repository.UserLevelRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LevelService {
    private final LevelRepository levelRepository;
    private final UserLevelRepository userLevelRepository;

    public LevelService(LevelRepository levelRepository, UserLevelRepository userLevelRepository) {
        this.levelRepository = levelRepository;
        this.userLevelRepository = userLevelRepository;
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
        List<UserLevel> userLevels = userLevelRepository.findByLevelIdContaining(levelId);
        if (userLevels.isEmpty()) return Optional.empty();
        Set<UserDto> userDtos = new HashSet<>();
        for (UserLevel ul : userLevels) {
            if (ul.getUser() != null) {
                userDtos.add(DtoMapper.toUserDto(ul.getUser()));
            }
        }
        return Optional.of(userDtos);
    }

    public List<String> getLevelListByUserId(Integer userId) {
        UserLevel userLevel = userLevelRepository.findByUserId(userId);
        return Arrays.asList(userLevel.getLevelIds().split("\\|"));
    }
}
