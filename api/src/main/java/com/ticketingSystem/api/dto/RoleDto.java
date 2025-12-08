package com.ticketingSystem.api.dto;

import com.ticketingSystem.api.permissions.RolePermission;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

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
    private String parameterMaster;
    private String[] parameterMasterIds;
    private boolean isDeleted;
    private String description;
}
