package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RequesterUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RequesterUserRepository extends JpaRepository<RequesterUser, String> {
    Optional<RequesterUser> findByUsername(String username);

    @Query("SELECT r FROM RequesterUser r WHERE " +
            "(:query IS NULL OR :query = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(r.emailId) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.mobileNo) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:roleId IS NULL OR :roleId = '' OR r.roles LIKE CONCAT('%', :roleId, '%')) " +
            "AND (:stakeholderId IS NULL OR :stakeholderId = '' OR r.stakeholder LIKE CONCAT('%', :stakeholderId, '%'))")
    Page<RequesterUser> searchUsers(@Param("query") String query,
                                    @Param("roleId") String roleId,
                                    @Param("stakeholderId") String stakeholderId,
                                    Pageable pageable);
}
