package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.CategoryDto;
import com.ticketingSystem.api.dto.SubCategoryDto;
import com.ticketingSystem.api.dto.SubCategoryRequest;
import com.ticketingSystem.api.models.Category;
import com.ticketingSystem.api.models.SubCategory;
import com.ticketingSystem.api.service.CategoryService;
import com.ticketingSystem.api.service.SubCategoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<Category> addCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<Category> updateCategory(@PathVariable String categoryId,
                                                   @RequestBody Category category) {
        return categoryService.updateCategory(categoryId, category)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCategories(@RequestParam List<String> ids) {
        categoryService.deleteCategories(ids);
        return ResponseEntity.noContent().build();
    }

    /**
     * Return every sub-category for the supplied category id.
     * This is used by the UI to filter sub-categories client side so we keep
     * the response simple and always return an array (empty when nothing is found).
     */
    @GetMapping("/{categoryId}/sub-categories")
    public ResponseEntity<List<SubCategoryDto>> getAllSubCategoriesByCategory(@PathVariable String categoryId) {
        List<SubCategoryDto> subCategories = subCategoryService.getAllSubCategoriesByCategory(categoryId);
        return ResponseEntity.ok(subCategories);
    }

    @PostMapping("/{categoryId}/sub-categories")
    public ResponseEntity<SubCategory> addSubCategory(@PathVariable String categoryId,
                                                      @RequestBody SubCategoryRequest subCategory) {
        return ResponseEntity.ok(subCategoryService.saveSubCategory(categoryId, subCategory));
    }
}
