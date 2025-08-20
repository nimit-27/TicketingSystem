package com.example.api.service;

import com.example.api.dto.CategoryDto;
import com.example.api.dto.SubCategoryDto;
import com.example.api.models.Category;
import com.example.api.repository.CategoryRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import com.example.api.mapper.DtoMapper;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(DtoMapper::toCategoryDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public Category saveCategory(Category category) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        category.setTimestamp(now);
        category.setLastUpdated(now);
        if (category.getIsActive() == null) {
            category.setIsActive("Y");
        }
        return categoryRepository.save(category);
    }

    public Optional<Category> updateCategory(String id, Category updated) {
        return categoryRepository.findById(id)
                .map(existing -> {
                    existing.setCategory(updated.getCategory());
                    if (updated.getUpdatedBy() != null) existing.setUpdatedBy(updated.getUpdatedBy());
                    if (updated.getIsActive() != null) existing.setIsActive(updated.getIsActive());
                    return categoryRepository.save(existing);
                });
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }

    @Transactional
    public void deleteCategories(List<String> ids) {
        categoryRepository.deleteAllById(ids);
    }

    public Optional<Set<SubCategoryDto>> getSubCategoriesByCategory(String categoryId) {
        return categoryRepository
                .findById(categoryId)
                .map(category -> category.getSubCategories().stream()
                        .map(DtoMapper::toSubCategoryDto)
                        .collect(java.util.stream.Collectors.toSet()));
    }


}
