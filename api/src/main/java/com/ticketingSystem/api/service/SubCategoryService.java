package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.SubCategoryDto;
import com.ticketingSystem.api.exception.InvalidRequestException;
import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.models.Category;
import com.ticketingSystem.api.models.SubCategory;
import com.ticketingSystem.api.repository.CategoryRepository;
import com.ticketingSystem.api.repository.SeverityRepository;
import com.ticketingSystem.api.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.ticketingSystem.api.mapper.DtoMapper;

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
//        if (subCategory.getSeverity() == null ||
//                subCategory.getSeverity().getId() == null ||
//                subCategory.getSeverity().getId().isBlank()) {
//            throw new InvalidRequestException("Severity is required for a sub-category");
//        }

        String severityId = subCategory.getSeverity().getId();
        subCategory.setSeverity(
                severityRepository.findById(severityId)
                        .orElseThrow(() -> new ResourceNotFoundException("Severity", severityId))
        );
        LocalDateTime now = LocalDateTime.now();
        subCategory.setTimestamp(now);
        subCategory.setLastUpdated(now);
        if (subCategory.getIsActive() == null) subCategory.setIsActive("Y");
        return subCategoryRepository.save(subCategory);
    }

    public Optional<SubCategory> updateSubCategory(String id, SubCategory updated) {
        return subCategoryRepository.findById(id)
            .map(existing -> {
                if (updated.getSubCategory() != null && !updated.getSubCategory().isBlank()) {
                    existing.setSubCategory(updated.getSubCategory());
                }
                if (updated.getSeverity() != null) {
                    String severityId = updated.getSeverity().getId();
                    if (severityId == null || severityId.isBlank()) {
                        throw new InvalidRequestException("Severity is required for a sub-category");
                    } else {
                        existing.setSeverity(
                                severityRepository.findById(severityId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Severity", severityId))
                        );
                    }
                }
                existing.setLastUpdated(java.time.LocalDateTime.now());
                if (updated.getUpdatedBy() != null && !updated.getUpdatedBy().isBlank()) {
                    existing.setUpdatedBy(updated.getUpdatedBy());
                }
                return subCategoryRepository.save(existing);
            });
    }

    public void deleteSubCategory(String id) {
        subCategoryRepository.deleteById(id);
    }
}
