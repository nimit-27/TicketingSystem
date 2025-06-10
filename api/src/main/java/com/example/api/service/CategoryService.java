package com.example.api.service;

import com.example.api.dto.SubCategoryDto;
import com.example.api.models.Category;
import com.example.api.models.SubCategory;
import com.example.api.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Set<SubCategoryDto>> getSubCategoriesByCategory(String categoryId) {
        return categoryRepository
                .findById(Integer.valueOf(categoryId))
                .map(category -> {
                    Set<SubCategoryDto> subCategoryDtos = new HashSet<>();
                    for (SubCategory subCategory : category.getSubCategories()) {
                        SubCategoryDto dto = new SubCategoryDto();
                        dto.setSubCategoryId(subCategory.getSubCategoryId());
                        dto.setSubCategory(subCategory.getSubCategory());
                        dto.setCreatedBy(subCategory.getCreatedBy());
                        dto.setTimestamp(subCategory.getTimestamp());
                        dto.setLastUpdated(subCategory.getLastUpdated());
                        dto.setCategoryId(subCategory.getCategory().getCategoryId());
                        subCategoryDtos.add(dto);
                    }
                    return subCategoryDtos;
                });
    }
}
