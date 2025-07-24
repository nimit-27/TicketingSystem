package com.example.api.repository;

import com.example.api.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionConfigRepository extends JpaRepository<Role, String> {
}
