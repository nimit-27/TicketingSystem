package com.ticketingSystem.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubCategoryRequest {
    private String categoryId;
    private String subCategory;
    private String description;
    private String createdBy;
    private String updatedBy;
    private String isActive;
    private String severityId;
}
