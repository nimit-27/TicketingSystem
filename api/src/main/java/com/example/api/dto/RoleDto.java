package com.example.api.dto;

import com.example.api.permissions.RolePermission;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Setter
@Getter
public class RoleDto {
    private Integer roleId;
    private String role;
    private String createdBy;
    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;
    private String updatedBy;
    private RolePermission permissions;
    private String[] permissionsList;
    private String allowedStatusActionIds;
    private boolean isDeleted;
    private String description;
}
