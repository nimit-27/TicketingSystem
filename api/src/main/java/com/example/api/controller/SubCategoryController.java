package com.example.api.controller;

import com.example.api.dto.SubCategoryDto;
import com.example.api.models.SubCategory;
import com.example.api.service.SubCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/sub-categories")
@CrossOrigin(origins = "http://localhost:3000")
public class SubCategoryController {
    private final SubCategoryService subCategoryService;

    public SubCategoryController(SubCategoryService subCategoryService) {
        this.subCategoryService = subCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<SubCategoryDto>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryService.getAllSubCategories());
    }

    @GetMapping("/{subCategoryId}")
    public ResponseEntity<SubCategory> getSubCategoryDetails(@PathVariable String subCategoryId) {
        Optional<SubCategory> subCategory = subCategoryService.getSubCategoryDetails(subCategoryId);
        return subCategory.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(404).body(null));
    }

    @PutMapping("/{subCategoryId}")
    public ResponseEntity<SubCategory> updateSubCategory(@PathVariable String subCategoryId,
                                                         @RequestBody SubCategory subCategory) {
        return subCategoryService.updateSubCategory(subCategoryId, subCategory)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{subCategoryId}")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable String subCategoryId) {
        subCategoryService.deleteSubCategory(subCategoryId);
        return ResponseEntity.noContent().build();
    }
}
