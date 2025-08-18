package com.example.api.service;

import com.example.api.dto.RoleDto;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.Role;
import com.example.api.permissions.RolePermission;
import com.example.api.repository.RoleRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {
    private final RoleRepository roleRepository;
    private final PermissionService permissionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.developerMode:false}")
    private boolean developerMode;

    // Add a constructor for the required beans (without developerMode)
    public RoleService(RoleRepository roleRepository, PermissionService permissionService) {
        this.roleRepository = roleRepository;
        this.permissionService = permissionService;
    }

    public List<RoleDto> getAllRoles() {
        List<Role> roles = roleRepository.findByIsDeletedFalse();
        return roles.stream().map(DtoMapper::toRoleDto).collect(Collectors.toList());
    }

    public RoleDto addRole(RoleDto roleDto) throws JsonProcessingException {

        String[] permissionsList = roleDto.getPermissionsList();

        String json = "";
        RolePermission rolePermission = roleDto.getPermissions();

        if(rolePermission == null) {
            if (permissionsList.length == 1) {
                rolePermission = permissionService.getRolePermission(
                        Arrays.stream(permissionsList).findFirst().orElse(null));
            } else {
                rolePermission = permissionService.mergeRolePermissions(List.of(permissionsList));
            }
        }

        json = objectMapper.writeValueAsString(rolePermission);

        Role role = new Role();
        role.setRole(roleDto.getRole());
        role.setPermissions(json);
        role.setAllowedStatusActionIds(roleDto.getAllowedStatusActionIds());
        role.setDescription(roleDto.getDescription());
        LocalDateTime now = LocalDateTime.now();
        role.setCreatedOn(now);
        role.setCreatedBy(roleDto.getCreatedBy());
        role.setUpdatedOn(now);
        // updatedBy will be same as createdBy at creation
        role.setUpdatedBy(roleDto.getUpdatedBy());

        Role addedRole = roleRepository.save(role);
        return DtoMapper.toRoleDto(addedRole);
    }

    public void deleteRoles(List<String> roles, boolean hardDelete) {
        if (hardDelete && developerMode) {
            roleRepository.deleteAllById(roles);
        } else {
            for (String r : roles) {
                roleRepository.findById(r).ifPresent(role -> {
                    role.setDeleted(true);
                    roleRepository.save(role);
                });
            }
        }
    }

    public void updateRole(RoleDto dto) {
        roleRepository.findById(dto.getRole()).ifPresent(role -> {
            role.setUpdatedBy(dto.getUpdatedBy());
            role.setUpdatedOn(LocalDateTime.now());
            role.setAllowedStatusActionIds(dto.getAllowedStatusActionIds());
            if (dto.getDescription() != null) {
                role.setDescription(dto.getDescription());
            }
            roleRepository.save(role);
        });
    }

    public void renameRole(String oldRole, String newRole, String updatedBy) {
        roleRepository.renameRole(oldRole, newRole, updatedBy, LocalDateTime.now());
        try {
            permissionService.loadPermissions();
        } catch (Exception ignored) {
        }
    }
}
