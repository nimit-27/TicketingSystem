package com.example.api.controller;

import com.example.api.dto.SubCategoryDto;
import com.example.api.models.Category;
import com.example.api.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{categoryId}/sub-categories")
    public ResponseEntity<Set<SubCategoryDto>> getSubCategoriesByCategory(@PathVariable String categoryId) {
        Optional<Set<SubCategoryDto>> subCategoriesOptional = categoryService.getSubCategoriesByCategory(categoryId);
        return subCategoriesOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
