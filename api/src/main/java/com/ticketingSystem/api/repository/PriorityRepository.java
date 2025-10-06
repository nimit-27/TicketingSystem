package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriorityRepository extends JpaRepository<Priority, String> {
}
