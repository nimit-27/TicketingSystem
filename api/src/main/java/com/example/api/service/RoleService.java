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
        RolePermission rolePermission = null;
        if (permissionsList.length == 1) {
            rolePermission = permissionService.getRolePermission(String.valueOf(Arrays.stream(permissionsList).findFirst()));
        } else {
            rolePermission = permissionService.mergeRolePermissions(List.of(permissionsList));
        }

        String json = objectMapper.writeValueAsString(rolePermission);

        Role role = new Role();
        role.setRole(roleDto.getRole());
        role.setPermissions(json);
        LocalDateTime now = LocalDateTime.now();
        role.setCreatedOn(now);
        role.setCreatedBy(roleDto.getCreatedBy());

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
}
