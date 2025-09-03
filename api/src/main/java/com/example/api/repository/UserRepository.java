package com.example.api.repository;

import com.example.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    @Query(value = "SELECT * FROM users WHERE FIND_IN_SET(:roleId, REPLACE(roles, '|', ','))", nativeQuery = true)
    List<User> findByRoleId(@Param("roleId") String roleId);
}
