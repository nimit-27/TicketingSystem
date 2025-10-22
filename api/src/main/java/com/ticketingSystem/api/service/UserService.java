package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.CreateUserRequest;
import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.Level;
import com.ticketingSystem.api.models.Stakeholder;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.models.UserLevel;
import com.ticketingSystem.api.repository.LevelRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
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
    private final LevelRepository levelRepository;

    public UserService(UserRepository userRepository, StakeholderRepository stakeholderRepository,
                       RoleRepository roleRepository, LevelRepository levelRepository) {
        this.userRepository = userRepository;
        this.stakeholderRepository = stakeholderRepository;
        this.roleRepository = roleRepository;
        this.levelRepository = levelRepository;
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

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        validateUsername(request.getUsername());

        List<String> roleIds = sanitizeList(request.getRoleIds());
        List<String> stakeholderIds = sanitizeList(request.getStakeholderIds());
        List<String> levelIds = sanitizeList(request.getLevelIds());

        if (roleIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one role is required");
        }
        if (stakeholderIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one stakeholder is required");
        }
        if (levelIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one level is required");
        }

        ensureRolesExist(roleIds);
        ensureStakeholdersExist(stakeholderIds);
        ensureLevelsExist(levelIds);

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setName(request.getName().trim());
        user.setEmailId(request.getEmailId().trim());
        user.setMobileNo(request.getMobileNo().trim());
        user.setOffice(request.getOffice().trim());
        user.setRoles(String.join("|", roleIds));
        user.setStakeholder(String.join("|", stakeholderIds));
        user.setPassword(encodePassword(request.getPassword()));

        UserLevel userLevel = new UserLevel();
        userLevel.setLevelIds(String.join("|", levelIds));
        userLevel.setLevelId(levelIds.get(0));
        userLevel.setUser(user);
        user.setUserLevel(userLevel);

        User saved = userRepository.save(user);
        return mapUserWithStakeholder(saved);
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

    private void validateUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        String trimmed = username.trim();
        userRepository.findByUsername(trimmed).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        });
    }

    private List<String> sanitizeList(List<String> items) {
        if (items == null) {
            return Collections.emptyList();
        }
        return items.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private void ensureRolesExist(List<String> roleIds) {
        List<Integer> numericIds = roleIds.stream()
                .map(id -> {
                    try {
                        return Integer.valueOf(id);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        if (numericIds.isEmpty()) {
            return;
        }

        Map<Integer, Integer> existing = roleRepository.findAllById(numericIds).stream()
                .collect(Collectors.toMap(
                        com.ticketingSystem.api.models.Role::getRoleId,
                        com.ticketingSystem.api.models.Role::getRoleId));

        List<String> missing = numericIds.stream()
                .filter(id -> !existing.containsKey(id))
                .map(String::valueOf)
                .toList();

        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid role ids: " + String.join(", ", missing));
        }
    }

    private void ensureStakeholdersExist(List<String> stakeholderIds) {
        List<Integer> numericIds = stakeholderIds.stream()
                .map(id -> {
                    try {
                        return Integer.valueOf(id);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        if (numericIds.isEmpty()) {
            return;
        }

        Map<Integer, Integer> existing = stakeholderRepository.findAllById(new HashSet<>(numericIds)).stream()
                .collect(Collectors.toMap(Stakeholder::getId, Stakeholder::getId));

        List<String> missing = numericIds.stream()
                .filter(id -> !existing.containsKey(id))
                .map(String::valueOf)
                .toList();

        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid stakeholder ids: " + String.join(", ", missing));
        }
    }

    private void ensureLevelsExist(List<String> levelIds) {
        if (levelIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one level is required");
        }

        Map<String, String> existing = levelRepository.findAllById(levelIds).stream()
                .collect(Collectors.toMap(Level::getLevelId, Level::getLevelId));

        List<String> missing = levelIds.stream()
                .filter(id -> !existing.containsKey(id))
                .toList();

        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid level ids: " + String.join(", ", missing));
        }
    }

    private String encodePassword(String password) {
        String trimmed = password == null ? "" : password.trim();
        if (trimmed.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        if (isBcryptHash(trimmed)) {
            return trimmed;
        }
        return BCrypt.hashpw(trimmed, BCrypt.gensalt());
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
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

        List<String> stakeholderParts = Arrays.stream(stakeholderId.split("\\|"))
                .map(String::trim)
                .filter(part -> !part.isEmpty())
                .collect(Collectors.toList());

        if (stakeholderParts.isEmpty()) {
            return stakeholderId;
        }

        List<Integer> numericIds = stakeholderParts.stream()
                .map(part -> {
                    try {
                        return Integer.valueOf(part);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<Integer, String> stakeholderNameById = stakeholderRepository.findAllById(new HashSet<>(numericIds))
                .stream()
                .collect(Collectors.toMap(
                        Stakeholder::getId,
                        Stakeholder::getDescription,
                        (existing, replacement) -> existing));

        List<String> resolvedStakeholders = new ArrayList<>();
        for (String part : stakeholderParts) {
            String resolved = part;
            try {
                Integer id = Integer.valueOf(part);
                resolved = stakeholderNameById.getOrDefault(id, part);
            } catch (NumberFormatException ignored) {
                // Non-numeric stakeholder identifiers are returned as-is
            }
            resolvedStakeholders.add(resolved);
        }

        return String.join("|", resolvedStakeholders);
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
