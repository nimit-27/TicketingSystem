package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.AuthenticatedUser;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.enums.ClientType;
import com.ticketingSystem.api.permissions.RolePermission;
import com.ticketingSystem.api.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class LoginPayloadService {
    private final AuthService authService;
    private final PermissionService permissionService;
    private final RoleRepository roleRepository;

    public LoginPayloadService(AuthService authService,
                               PermissionService permissionService,
                               RoleRepository roleRepository) {
        this.authService = authService;
        this.permissionService = permissionService;
        this.roleRepository = roleRepository;
    }

    public LoginPayload buildPayload(AuthenticatedUser user) {
        List<String> roles = splitPipeSeparated(user.getRoles());
        List<Integer> roleIds = roles.stream()
                .filter(r -> !r.isBlank())
                .map(Integer::parseInt)
                .toList();

        List<String> levels = user.getUserLevel() == null || user.getUserLevel().getLevelIds() == null
                ? List.of()
                : splitPipeSeparated(user.getUserLevel().getLevelIds());

        RolePermission permissions = permissionService.mergeRolePermissions(roleIds);

        Set<String> allowedStatusActionIds = new HashSet<>();
        Set<String> allowedCrStatusActionIds = new HashSet<>();
        roleRepository.findAllById(roleIds).forEach(r -> {
            addPipeSeparatedValues(allowedStatusActionIds, r.getAllowedStatusActionIds());
            addPipeSeparatedValues(allowedCrStatusActionIds, r.getAllowedCrStatusActionIds());
        });

        return LoginPayload.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .roles(roles)
                .levels(levels)
                .stakeholderId(user.getStakeholder())
                .permissions(permissions)
                .allowedStatusActionIds(allowedStatusActionIds)
                .allowedCrStatusActionIds(allowedCrStatusActionIds)
                .officeType(user.getOfficeType())
                .officeCode(user.getOfficeCode())
                .zoneCode(user.getZoneCode())
                .regionCode(user.getRegionCode())
                .districtCode(user.getDistrictCode())
                .clientType(ClientType.INTERNAL)
                .build();
    }

    public Optional<LoginPayload> hydrate(LoginPayload tokenPayload) {
        if (tokenPayload == null || tokenPayload.getUsername() == null || tokenPayload.getUsername().isBlank()) {
            return Optional.empty();
        }
        return authService.findUserByUsername(tokenPayload.getUsername(), null)
                .or(() -> authService.findUserByUsername(tokenPayload.getUsername(), "requestor"))
                .map(this::buildPayload);
    }

    private List<String> splitPipeSeparated(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.asList(value.split("\\|"));
    }

    private void addPipeSeparatedValues(Set<String> target, String value) {
        if (value == null) {
            return;
        }
        for (String entry : value.split("\\|")) {
            if (!entry.isBlank()) {
                target.add(entry.trim());
            }
        }
    }
}
