package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {
}
