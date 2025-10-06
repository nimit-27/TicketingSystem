package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.dto.LevelDto;
import com.ticketingSystem.api.models.Stakeholder;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.models.UserLevel;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.repository.LevelRepository;
import com.ticketingSystem.api.repository.UserLevelRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
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

    private UserDto mapUserWithStakeholder(User user) {
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
                    .map(Stakeholder::getDescription)
                    .orElse(stakeholderId);
        } catch (NumberFormatException ex) {
            return stakeholderId;
        }
    }
}
