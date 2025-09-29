package com.example.api.service;

import com.example.api.dto.UserDto;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.User;
import com.example.api.repository.StakeholderRepository;
import com.example.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final StakeholderRepository stakeholderRepository;

    public UserService(UserRepository userRepository, StakeholderRepository stakeholderRepository) {
        this.userRepository = userRepository;
        this.stakeholderRepository = stakeholderRepository;
    }

    public Optional<UserDto> getUserDetails(String userId) {
        return userRepository.findById(userId).map(this::mapUserWithStakeholder);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserWithStakeholder)
                .filter(Objects::nonNull)
                .toList();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<UserDto> getUsersByRoles(List<String> roleIds) {
        return userRepository.findAll().stream()
                .filter(user -> {
                    if (user.getRoles() == null) return false;
                    String[] roles = user.getRoles().split("\\|");
                    return Arrays.stream(roles).anyMatch(roleIds::contains);
                })
                .map(this::mapUserWithStakeholder)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public Optional<User> updateUser(String id, User updated) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setEmailId(updated.getEmailId());
                    existing.setMobileNo(updated.getMobileNo());
                    existing.setOffice(updated.getOffice());
                    existing.setUsername(updated.getUsername());
                    return userRepository.save(existing);
                });
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
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
                    .map(com.example.api.models.Stakeholder::getDescription)
                    .orElse(stakeholderId);
        } catch (NumberFormatException ex) {
            return stakeholderId;
        }
    }
}
