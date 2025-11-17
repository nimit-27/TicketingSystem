package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RequesterUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RequesterUserRepository extends JpaRepository<RequesterUser, String> {
    Optional<RequesterUser> findByUsername(String username);
}
