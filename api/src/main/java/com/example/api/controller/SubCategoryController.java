package com.example.api.controller;

import com.example.api.models.SubCategory;
import com.example.api.service.SubCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/sub-categories")
@CrossOrigin(origins = "http://localhost:3000")
public class SubCategoryController {
    private final SubCategoryService subCategoryService;

    public SubCategoryController(SubCategoryService subCategoryService) {
        this.subCategoryService = subCategoryService;
    }

    @GetMapping("/{subCategoryId}")
    public ResponseEntity<SubCategory> getSubCategoryDetails(@PathVariable Integer subCategoryId) {
        Optional<SubCategory> subCategory = subCategoryService.getSubCategoryDetails(subCategoryId);
        return subCategory.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(404).body(null));
    }
}
