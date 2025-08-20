package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
public class CategoryDto {
    private String categoryId;
    private String category;
    private String createdBy;
    private LocalDateTime timestamp;
    private LocalDateTime lastUpdated;
    private String updatedBy;
    private String isActive;
    private Set<SubCategoryDto> subCategories;
}
