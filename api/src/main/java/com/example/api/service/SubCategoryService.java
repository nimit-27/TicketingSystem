package com.example.api.service;

import com.example.api.controller.SubCategoryController;
import com.example.api.dto.SubCategoryDto;
import com.example.api.models.Category;
import com.example.api.models.SubCategory;
import com.example.api.repository.CategoryRepository;
import com.example.api.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubCategoryService {
    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;

    public SubCategoryService(SubCategoryRepository subCategoryRepository, CategoryRepository categoryRepository) {
        this.subCategoryRepository = subCategoryRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<SubCategoryDto> getAllSubCategories() {
        List<SubCategory> subCategories = subCategoryRepository.findAll();
        return subCategories.stream()
            .map(subCategory -> {
            SubCategoryDto dto = new SubCategoryDto();
            dto.setSubCategoryId(subCategory.getSubCategoryId());
            dto.setSubCategory(subCategory.getSubCategory());
            dto.setCreatedBy(subCategory.getCreatedBy());
            dto.setTimestamp(subCategory.getTimestamp());
            dto.setCategoryId(subCategory.getCategory() != null ? subCategory.getCategory().getCategoryId() : null);
            dto.setLastUpdated(subCategory.getLastUpdated());
            return dto;
            })
            .toList();
    }

    public Optional<SubCategory> getSubCategoryDetails(Integer subCategoryId) {
        return subCategoryRepository.findById(subCategoryId);
    }

    public SubCategory saveSubCategory(Integer categoryId, SubCategory subCategory) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        subCategory.setCategory(category);
        subCategoryRepository.save(subCategory);

        return subCategoryRepository.save(subCategory);
    }
}
