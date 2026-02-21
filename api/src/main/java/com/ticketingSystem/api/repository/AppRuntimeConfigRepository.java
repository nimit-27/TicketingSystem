package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.AppRuntimeConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppRuntimeConfigRepository extends JpaRepository<AppRuntimeConfig, String> {
}
