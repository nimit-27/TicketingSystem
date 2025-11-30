package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE " +
            "(:query IS NULL OR :query = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.emailId) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.mobileNo) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:roleId IS NULL OR :roleId = '' OR u.roles LIKE CONCAT('%', :roleId, '%')) " +
            "AND (:stakeholderId IS NULL OR :stakeholderId = '' OR u.stakeholder LIKE CONCAT('%', :stakeholderId, '%'))")
    Page<User> searchUsers(@Param("query") String query,
                           @Param("roleId") String roleId,
                           @Param("stakeholderId") String stakeholderId,
                           Pageable pageable);
}
