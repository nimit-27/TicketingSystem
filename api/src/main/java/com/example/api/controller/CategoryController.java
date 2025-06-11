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

    @PostMapping
    public ResponseEntity<Category> addCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<Category> updateCategory(@PathVariable Integer categoryId,
                                                   @RequestBody Category category) {
        return categoryService.updateCategory(categoryId, category)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCategories(@RequestParam List<Integer> ids) {
        categoryService.deleteCategories(ids);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}/sub-categories")
    public ResponseEntity<Set<SubCategoryDto>> getSubCategoriesByCategory(@PathVariable String categoryId) {
        Optional<Set<SubCategoryDto>> subCategoriesOptional = categoryService.getSubCategoriesByCategory(categoryId);
        return subCategoriesOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
