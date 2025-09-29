package com.example.api.service;

import com.example.api.dto.UserDto;
import com.example.api.dto.LevelDto;
import com.example.api.models.Level;
import com.example.api.models.UserLevel;
import com.example.api.mapper.DtoMapper;
import com.example.api.repository.LevelRepository;
import com.example.api.repository.UserLevelRepository;
import com.example.api.repository.StakeholderRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LevelService {
    private final LevelRepository levelRepository;
    private final UserLevelRepository userLevelRepository;
    private final StakeholderRepository stakeholderRepository;

    public LevelService(LevelRepository levelRepository, UserLevelRepository userLevelRepository, StakeholderRepository stakeholderRepository) {
        this.levelRepository = levelRepository;
        this.userLevelRepository = userLevelRepository;
        this.stakeholderRepository = stakeholderRepository;
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
        List<UserLevel> userLevels = userLevelRepository.findByLevelIdsContaining(levelId);
        if (userLevels.isEmpty()) return Optional.empty();
        Set<UserDto> userDtos = new HashSet<>();
        for (UserLevel ul : userLevels) {
            if (ul.getUser() != null) {
                UserDto dto = mapUserWithStakeholder(ul.getUser());
                if (dto != null) {
                    userDtos.add(dto);
                }
            }
        }
        return Optional.of(userDtos);
    }

    public List<String> getLevelListByUserId(String userId) {
        UserLevel userLevel = userLevelRepository.findByUserId(userId);
        if (userLevel == null || userLevel.getLevelIds() == null) {
            return Collections.emptyList();
        }
        return Arrays.asList(userLevel.getLevelIds().split("\\|"));
    }

    private UserDto mapUserWithStakeholder(com.example.api.models.User user) {
        UserDto dto = DtoMapper.toUserDto(user);
        if (dto == null) {
            return null;
        }
        dto.setStakeholderId(user.getStakeholder());
        dto.setStakeholder(resolveStakeholderName(user.getStakeholder()));
        return dto;
    }

    private String resolveStakeholderName(String stakeholderId) {
        if (stakeholderId == null || stakeholderId.isBlank()) {
            return null;
        }
        try {
            Integer id = Integer.valueOf(stakeholderId);
            return stakeholderRepository.findById(id)
                    .map(com.example.api.models.Stakeholder::getDescription)
                    .orElse(stakeholderId);
        } catch (NumberFormatException ex) {
            return stakeholderId;
        }
    }
}
