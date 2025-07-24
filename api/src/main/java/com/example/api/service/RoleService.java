package com.example.api.service;

import com.example.api.dto.RoleDto;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.Role;
import com.example.api.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    public List<RoleDto> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream().map(DtoMapper::toRoleDto).collect(Collectors.toList());
    }
}
