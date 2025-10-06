package com.ticketingSystem.api.dto;

import com.ticketingSystem.api.permissions.RolePermission;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PermissionsConfigDto {
    private Map<Integer, RolePermission> roles;
}
