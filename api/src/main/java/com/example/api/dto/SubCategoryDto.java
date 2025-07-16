package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SubCategoryDto {
    private String subCategoryId;
    private String subCategory;
    private String createdBy;
    private LocalDateTime timestamp;
    private String categoryId;
    private LocalDateTime lastUpdated;
}
