package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {
}
