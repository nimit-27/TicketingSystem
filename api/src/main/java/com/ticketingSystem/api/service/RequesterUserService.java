package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.PaginationResponse;
import com.ticketingSystem.api.dto.RequesterUserDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.Stakeholder;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RequesterUserService {
    private final RequesterUserRepository requesterUserRepository;
    private final StakeholderRepository stakeholderRepository;
    private final RoleRepository roleRepository;

    public RequesterUserService(RequesterUserRepository requesterUserRepository,
                                StakeholderRepository stakeholderRepository,
                                RoleRepository roleRepository) {
        this.requesterUserRepository = requesterUserRepository;
        this.stakeholderRepository = stakeholderRepository;
        this.roleRepository = roleRepository;
    }

    public List<RequesterUserDto> getAllRequesterUsers() {
        return requesterUserRepository.findAll().stream()
                .map(this::mapRequesterUser)
                .toList();
    }

    public Optional<RequesterUserDto> getRequesterUser(String userId) {
        return requesterUserRepository.findById(userId)
                .map(this::mapRequesterUser);
    }

    public PaginationResponse<RequesterUserDto> searchRequesterUsers(String query, String roleId, String stakeholderId, Pageable pageable) {
        Page<RequesterUser> page = requesterUserRepository.searchUsers(trimToNull(query), trimToNull(roleId), trimToNull(stakeholderId), pageable);
        List<RequesterUserDto> items = page.getContent().stream()
                .map(this::mapRequesterUser)
                .filter(Objects::nonNull)
                .toList();
        return new PaginationResponse<>(items, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    private RequesterUserDto mapRequesterUser(RequesterUser user) {
        RequesterUserDto dto = DtoMapper.toRequesterUserDto(user);
        if (dto == null) {
            return null;
        }

        List<String> roleIds = splitIds(user.getRoles());
        List<String> roleNames = resolveRoleNames(user.getRoles());
        dto.setRoleIds(roleIds);
        dto.setRoleNames(roleNames);
        dto.setRoles(roleNames.isEmpty() ? null : String.join(", ", roleNames));
        dto.setStakeholderId(user.getStakeholder());
        dto.setStakeholder(resolveStakeholderName(user.getStakeholder()));
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

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private List<String> splitIds(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(value.split("\\|"))
                .map(String::trim)
                .filter(part -> !part.isEmpty())
                .toList();
    }
}
