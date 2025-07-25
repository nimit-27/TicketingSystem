package com.example.api.repository;

import com.example.api.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleRepository extends JpaRepository<Role, String> {
    List<Role> findByIsDeletedFalse();
}
