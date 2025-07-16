package com.example.api.repository;

import com.example.api.models.Level;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LevelRepository extends JpaRepository<Level, String> {
    java.util.Optional<Level> findByLevelName(String levelName);
}
