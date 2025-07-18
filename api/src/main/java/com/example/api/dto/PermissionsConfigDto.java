package com.example.api.dto;

import com.example.api.permissions.RolePermission;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PermissionsConfigDto {
    private Map<String, RolePermission> roles;
}
