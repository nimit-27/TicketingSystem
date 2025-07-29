package com.example.api.repository;

import com.example.api.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface RoleRepository extends JpaRepository<Role, String> {
    List<Role> findByIsDeletedFalse();

    @Modifying
    @Transactional
    @Query(value = "UPDATE role_permission_config SET role = :newRole, updated_by = :updatedBy, updated_on = :updatedOn WHERE role = :oldRole", nativeQuery = true)
    void renameRole(@Param("oldRole") String oldRole,
                    @Param("newRole") String newRole,
                    @Param("updatedBy") String updatedBy,
                    @Param("updatedOn") java.time.LocalDateTime updatedOn);
}
