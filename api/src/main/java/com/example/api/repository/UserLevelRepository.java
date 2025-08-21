package com.example.api.repository;

import com.example.api.models.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserLevelRepository extends JpaRepository<UserLevel, String> {
    List<UserLevel> findByLevelIdContaining(String levelId);

    UserLevel findByUserId(Integer userId);
}
