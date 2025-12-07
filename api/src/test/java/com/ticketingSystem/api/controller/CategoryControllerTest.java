package com.ticketingSystem.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.dto.CategoryDto;
import com.ticketingSystem.api.dto.SubCategoryDto;
import com.ticketingSystem.api.dto.SubCategoryRequest;
import com.ticketingSystem.api.models.Category;
import com.ticketingSystem.api.models.SubCategory;
import com.ticketingSystem.api.service.CategoryService;
import com.ticketingSystem.api.service.SubCategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @Mock
    private SubCategoryService subCategoryService;

    @InjectMocks
    private CategoryController categoryController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController)
                .setMessageConverters(converter)
                .build();
    }

    @Test
    void getAllCategoriesReturnsDataFromService() throws Exception {
        CategoryDto category = new CategoryDto();
        category.setCategoryId("1");
        category.setCategory("Hardware");

        when(categoryService.getAllCategories()).thenReturn(List.of(category));

        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoryId").value("1"))
                .andExpect(jsonPath("$[0].category").value("Hardware"));
    }

    @Test
    void addCategoryPersistsCategory() throws Exception {
        Category category = new Category();
        category.setCategory("Network");

        when(categoryService.saveCategory(any(Category.class))).thenReturn(category);

        mockMvc.perform(post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(category)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("Network"));
    }

    @Test
    void updateCategoryReturnsUpdatedEntityWhenPresent() throws Exception {
        Category updateRequest = new Category();
        updateRequest.setCategory("Updated");

        Category updated = new Category();
        updated.setCategoryId("123");
        updated.setCategory("Updated");

        when(categoryService.updateCategory(eq("123"), any(Category.class))).thenReturn(Optional.of(updated));

        mockMvc.perform(put("/categories/{categoryId}", "123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryId").value("123"))
                .andExpect(jsonPath("$.category").value("Updated"));
    }

    @Test
    void updateCategoryReturnsNotFoundWhenMissing() throws Exception {
        when(categoryService.updateCategory(eq("404"), any(Category.class))).thenReturn(Optional.empty());

        mockMvc.perform(put("/categories/{categoryId}", "404")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Category())))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCategoryRemovesSingleCategory() throws Exception {
        mockMvc.perform(delete("/categories/{categoryId}", "delete-me"))
                .andExpect(status().isNoContent());

        verify(categoryService).deleteCategory("delete-me");
    }

    @Test
    void deleteCategoriesRemovesMultiple() throws Exception {
        mockMvc.perform(delete("/categories")
                        .param("ids", "1", "2", "3"))
                .andExpect(status().isNoContent());

        verify(categoryService).deleteCategories(List.of("1", "2", "3"));
    }

    @Test
    void getSubCategoriesReturnsList() throws Exception {
        SubCategoryDto subCategoryDto = new SubCategoryDto();
        subCategoryDto.setSubCategoryId("sub-1");
        subCategoryDto.setSubCategory("Printers");

        when(subCategoryService.getAllSubCategoriesByCategory("cat-1"))
                .thenReturn(List.of(subCategoryDto));

        mockMvc.perform(get("/categories/{categoryId}/sub-categories", "cat-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subCategoryId").value("sub-1"))
                .andExpect(jsonPath("$[0].subCategory").value("Printers"));
    }

    @Test
    void addSubCategoryCreatesResource() throws Exception {
        SubCategoryRequest request = new SubCategoryRequest();
        request.setSubCategory("Laptops");

        SubCategory saved = new SubCategory();
        saved.setSubCategoryId("saved-id");
        saved.setSubCategory("Laptops");

        when(subCategoryService.saveSubCategory(eq("cat-22"), any(SubCategoryRequest.class)))
                .thenReturn(saved);

        mockMvc.perform(post("/categories/{categoryId}/sub-categories", "cat-22")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subCategoryId").value("saved-id"))
                .andExpect(jsonPath("$.subCategory").value("Laptops"));
    }
}
