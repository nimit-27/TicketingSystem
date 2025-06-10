package com.example.api.service;

import com.example.api.models.SubCategory;
import com.example.api.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SubCategoryService {
    private final SubCategoryRepository subCategoryRepository;

    public SubCategoryService(SubCategoryRepository subCategoryRepository) {
        this.subCategoryRepository = subCategoryRepository;
    }

    public Optional<SubCategory> getSubCategoryDetails(Integer subCategoryId) {
        return subCategoryRepository.findById(subCategoryId);
    }
}
