package com.ticketingSystem.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SubCategoryDto {
    private String subCategoryId;
    private String subCategory;
    private String description;
    private String createdBy;
    private LocalDateTime timestamp;
    private String categoryId;
    private LocalDateTime lastUpdated;
    private String severityId;
    private String updatedBy;
    private String isActive;
}
