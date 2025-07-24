package com.example.api.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
public class RoleDto {
    private String role;
    private String createdBy;
    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;
    private String updatedBy;
}
