package com.example.api.dto;

import com.example.api.permissions.RolePermission;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Setter
@Getter
public class RoleDto {
    private String role;
    private String createdBy;
    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;
    private String updatedBy;
    private RolePermission permissions;
    private String[] permissionsList;
    private String allowedStatusActionIds;
    private boolean isDeleted;
}
