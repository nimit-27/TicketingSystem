package com.example.api.permissions;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PermissionsConfig {
    private Map<Integer, RolePermission> roles;
}
