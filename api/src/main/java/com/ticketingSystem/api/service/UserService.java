package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.Stakeholder;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final StakeholderRepository stakeholderRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, StakeholderRepository stakeholderRepository,
                       RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.stakeholderRepository = stakeholderRepository;
        this.roleRepository = roleRepository;
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
        dto.setRoleNames(resolveRoleNames(user.getRoles()));
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

    private List<String> resolveRoleNames(String roleIds) {
        if (roleIds == null || roleIds.isBlank()) {
            return Collections.emptyList();
        }

        List<Integer> ids = Arrays.stream(roleIds.split("\\|"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(id -> {
                    try {
                        return Integer.valueOf(id);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (ids.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Integer, String> roleNameById = roleRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(
                        com.ticketingSystem.api.models.Role::getRoleId,
                        com.ticketingSystem.api.models.Role::getRole,
                        (existing, replacement) -> existing));

        return ids.stream()
                .map(roleNameById::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
