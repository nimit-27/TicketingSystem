package com.example.api.service;

import com.example.api.dto.SubCategoryDto;
import com.example.api.exception.ResourceNotFoundException;
import com.example.api.models.Category;
import com.example.api.models.SubCategory;
import com.example.api.repository.CategoryRepository;
import com.example.api.repository.SeverityRepository;
import com.example.api.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.example.api.mapper.DtoMapper;

@Service
public class SubCategoryService {
    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final SeverityRepository severityRepository;

    public SubCategoryService(SubCategoryRepository subCategoryRepository,
                              CategoryRepository categoryRepository,
                              SeverityRepository severityRepository) {
        this.subCategoryRepository = subCategoryRepository;
        this.categoryRepository = categoryRepository;
        this.severityRepository = severityRepository;
    }

    public List<SubCategoryDto> getAllSubCategories() {
        List<SubCategory> subCategories = subCategoryRepository.findAll();
        return subCategories.stream()
            .map(DtoMapper::toSubCategoryDto)
            .toList();
    }

    public Optional<SubCategory> getSubCategoryDetails(String subCategoryId) {
        return subCategoryRepository.findById(subCategoryId);
    }

    public SubCategory saveSubCategory(String categoryId, SubCategory subCategory) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        subCategory.setCategory(category);
        if (subCategory.getSeverity() != null && subCategory.getSeverity().getId() != null) {
            severityRepository.findById(subCategory.getSeverity().getId())
                    .ifPresent(subCategory::setSeverity);
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        subCategory.setTimestamp(now);
        subCategory.setLastUpdated(now);
        if (subCategory.getIsActive() == null) {
            subCategory.setIsActive("Y");
        }
        return subCategoryRepository.save(subCategory);
    }

    public Optional<SubCategory> updateSubCategory(String id, SubCategory updated) {
        return subCategoryRepository.findById(id)
            .map(existing -> {
                existing.setSubCategory(updated.getSubCategory());
                return subCategoryRepository.save(existing);
            });
    }

    public void deleteSubCategory(String id) {
        subCategoryRepository.deleteById(id);
    }
}
