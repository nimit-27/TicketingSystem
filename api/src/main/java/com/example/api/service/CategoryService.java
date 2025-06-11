package com.example.api.service;

import com.example.api.dto.CategoryDto;
import com.example.api.dto.SubCategoryDto;
import com.example.api.models.Category;
import com.example.api.models.SubCategory;
import com.example.api.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

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

    public List<CategoryDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream().map(category -> {
            CategoryDto dto = new CategoryDto();
            dto.setCategoryId(category.getCategoryId());
            dto.setCategory(category.getCategory());
            dto.setCreatedBy(category.getCreatedBy());
            dto.setTimestamp(category.getTimestamp());
            dto.setLastUpdated(category.getLastUpdated());
            if (category.getSubCategories() != null) {
                Set<SubCategoryDto> subCategoryDtos = category.getSubCategories().stream().map(subCategory -> {
                    SubCategoryDto subDto = new SubCategoryDto();
                    subDto.setSubCategoryId(subCategory.getSubCategoryId());
                    subDto.setSubCategory(subCategory.getSubCategory());
                    subDto.setCreatedBy(subCategory.getCreatedBy());
                    subDto.setTimestamp(subCategory.getTimestamp());
                    subDto.setLastUpdated(subCategory.getLastUpdated());
                    subDto.setCategoryId(category.getCategoryId());
                    return subDto;
                }).collect(java.util.stream.Collectors.toSet());
                dto.setSubCategories(subCategoryDtos);
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Optional<Category> updateCategory(Integer id, Category updated) {
        return categoryRepository.findById(id)
                .map(existing -> {
                    existing.setCategory(updated.getCategory());
                    return categoryRepository.save(existing);
                });
    }

    public void deleteCategory(Integer id) {
        categoryRepository.deleteById(id);
    }

    @Transactional
    public void deleteCategories(List<Integer> ids) {
        categoryRepository.deleteAllById(ids);
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
