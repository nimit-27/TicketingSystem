package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Level;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LevelRepository extends JpaRepository<Level, String> {
    java.util.Optional<Level> findByLevelName(String levelName);
}
