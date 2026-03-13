package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.CategoryDto;
import com.ticketingSystem.api.models.Category;
import com.ticketingSystem.api.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService service;

    @Test
    void getAllCategoriesShouldMapEntitiesToDtos() {
        Category category = new Category();
        category.setCategoryId("c1");
        category.setCategory("Infrastructure");
        category.setIsActive("Y");
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryDto> result = service.getAllCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategoryId()).isEqualTo("c1");
        assertThat(result.get(0).getCategory()).isEqualTo("Infrastructure");
    }

    @Test
    void saveCategoryShouldPopulateDefaultsAndAuditFields() {
        Category category = new Category();
        category.setCategory("Electrical");
        when(categoryRepository.save(category)).thenReturn(category);

        service.saveCategory(category);

        assertThat(category.getTimestamp()).isNotNull();
        assertThat(category.getLastUpdated()).isNotNull();
        assertThat(category.getIsActive()).isEqualTo("Y");
    }

    @Test
    void updateCategoryShouldOnlyOverwriteNullableFieldsWhenProvided() {
        Category existing = new Category();
        existing.setCategory("Old");
        existing.setUpdatedBy("u1");
        existing.setIsActive("Y");
        Category update = new Category();
        update.setCategory("New");
        // null values here should preserve existing optional values.
        update.setUpdatedBy(null);
        update.setIsActive(null);

        when(categoryRepository.findById("1")).thenReturn(Optional.of(existing));
        when(categoryRepository.save(existing)).thenReturn(existing);

        Optional<Category> result = service.updateCategory("1", update);

        assertThat(result).contains(existing);
        assertThat(existing.getCategory()).isEqualTo("New");
        assertThat(existing.getUpdatedBy()).isEqualTo("u1");
        assertThat(existing.getIsActive()).isEqualTo("Y");
    }

    @Test
    void updateCategoryShouldReturnEmptyWhenMissing() {
        when(categoryRepository.findById("404")).thenReturn(Optional.empty());

        assertThat(service.updateCategory("404", new Category())).isEmpty();
    }

    @Test
    void deleteMethodsShouldDelegateToRepository() {
        service.deleteCategory("one");
        verify(categoryRepository).deleteById("one");

        List<String> ids = List.of("a", "b");
        service.deleteCategories(ids);

        ArgumentCaptor<List<String>> captor = ArgumentCaptor.forClass(List.class);
        verify(categoryRepository).deleteAllById(captor.capture());
        assertThat(captor.getValue()).containsExactly("a", "b");
    }
}
