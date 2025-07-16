package com.example.api.permissions;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class RolePermission {
    private Map<String, Map<String, Object>> sidebar;
    private Map<String, Map<String, Object>> forms;
}
