package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {
    List<SubCategory> findByCategory_CategoryId(String categoryId);
}
