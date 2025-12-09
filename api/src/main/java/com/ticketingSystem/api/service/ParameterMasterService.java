package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.ParameterMaster;
import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.repository.ParameterMasterRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class ParameterMasterService {
    private final ParameterMasterRepository repository;
    private final RoleRepository roleRepository;

    public ParameterMasterService(ParameterMasterRepository repository, RoleRepository roleRepository) {
        this.repository = repository;
        this.roleRepository = roleRepository;
    }

    public List<ParameterMaster> getAll() {
        return repository.findAll();
    }

    public List<ParameterMaster> getParametersForRoles(List<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return List.of();
        }

        List<Integer> normalizedRoleIds = roleIds.stream()
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .map(this::toIntegerOrNull)
                .filter(id -> id != null)
                .toList();

        if (normalizedRoleIds.isEmpty()) {
            return List.of();
        }

        Set<String> parameterIds = roleRepository.findAllById(normalizedRoleIds).stream()
                .map(Role::getParameterMaster)
                .filter(param -> param != null && !param.isBlank())
                .flatMap(param -> Arrays.stream(param.split("\\|")))
                .map(String::trim)
                .filter(param -> !param.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (parameterIds.isEmpty()) {
            return List.of();
        }

        return repository.findAllById(parameterIds);
    }

    private Integer toIntegerOrNull(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
