package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserLevelRepository extends JpaRepository<UserLevel, String> {
    List<UserLevel> findByLevelIdsContaining(String levelId);

    UserLevel findByUserId(String userId);
}
