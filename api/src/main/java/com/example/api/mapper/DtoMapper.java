package com.example.api.mapper;

import com.example.api.dto.CategoryDto;
import com.example.api.dto.SubCategoryDto;
import com.example.api.models.Category;
import com.example.api.models.SubCategory;

import java.util.Set;
import java.util.stream.Collectors;

public class DtoMapper {
    public static CategoryDto toCategoryDto(Category category) {
        if (category == null) return null;
        CategoryDto dto = new CategoryDto();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategory(category.getCategory());
        dto.setCreatedBy(category.getCreatedBy());
        dto.setTimestamp(category.getTimestamp());
        dto.setLastUpdated(category.getLastUpdated());
        if (category.getSubCategories() != null) {
            Set<SubCategoryDto> subDtos = category.getSubCategories().stream()
                    .map(DtoMapper::toSubCategoryDto)
                    .collect(Collectors.toSet());
            dto.setSubCategories(subDtos);
        }
        return dto;
    }

    public static SubCategoryDto toSubCategoryDto(SubCategory subCategory) {
        if (subCategory == null) return null;
        SubCategoryDto dto = new SubCategoryDto();
        dto.setSubCategoryId(subCategory.getSubCategoryId());
        dto.setSubCategory(subCategory.getSubCategory());
        dto.setCreatedBy(subCategory.getCreatedBy());
        dto.setTimestamp(subCategory.getTimestamp());
        dto.setLastUpdated(subCategory.getLastUpdated());
        dto.setCategoryId(subCategory.getCategory() != null ? subCategory.getCategory().getCategoryId() : null);
        return dto;
    }
}
