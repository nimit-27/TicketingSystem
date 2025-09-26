package com.example.api.dto;

import com.example.api.permissions.RolePermission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginPayload {
    private String userId;
    private String username;
    private String name;
    private List<String> roles;
    private List<String> levels;
    private RolePermission permissions;
    private Set<String> allowedStatusActionIds;
}
