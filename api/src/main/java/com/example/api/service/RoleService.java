package com.example.api.service;

import com.example.api.dto.RoleDto;
import com.example.api.dto.RoleSummaryDto;
import com.example.api.exception.ResourceNotFoundException;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.Role;
import com.example.api.permissions.RolePermission;
import com.example.api.repository.RoleRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    public List<RoleSummaryDto> getRoleSummaries() {
        return roleRepository.findByIsDeletedFalseOrderByRoleAsc()
                .stream()
                .map(role -> new RoleSummaryDto(role.getRoleId(), role.getRole()))
                .collect(Collectors.toList());
    }

    public RoleDto getRoleById(Integer roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));
        return DtoMapper.toRoleDto(role);
    }

    public RoleDto addRole(RoleDto roleDto) throws JsonProcessingException {

        String[] permissionsList = roleDto.getPermissionsList();

        String json = "";
        RolePermission rolePermission = roleDto.getPermissions();

        if(rolePermission == null) {
            if (permissionsList.length == 1) {
                Integer id = Integer.valueOf(Arrays.stream(permissionsList).findFirst().orElse("0"));
                rolePermission = permissionService.getRolePermission(id);
            } else {
                List<Integer> ids = Arrays.stream(permissionsList).map(Integer::valueOf).toList();
                rolePermission = permissionService.mergeRolePermissions(ids);
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

    public void deleteRoles(List<Integer> roles, boolean hardDelete) {
        if (hardDelete && developerMode) {
            roleRepository.deleteAllById(roles);
        } else {
            for (Integer r : roles) {
                roleRepository.findById(r).ifPresent(role -> {
                    role.setDeleted(true);
                    roleRepository.save(role);
                });
            }
        }
    }

    public void updateRole(RoleDto dto) {
        roleRepository.findById(dto.getRoleId()).ifPresent(role -> {
            role.setUpdatedBy(dto.getUpdatedBy());
            role.setUpdatedOn(LocalDateTime.now());
            role.setAllowedStatusActionIds(dto.getAllowedStatusActionIds());
            if (dto.getDescription() != null) {
                role.setDescription(dto.getDescription());
            }
            roleRepository.save(role);
        });
    }

    public void renameRole(Integer roleId, String newRole, String updatedBy) {
        roleRepository.renameRole(roleId, newRole, updatedBy, LocalDateTime.now());
        try {
            permissionService.loadPermissions();
        } catch (Exception ignored) {
        }
    }
}
