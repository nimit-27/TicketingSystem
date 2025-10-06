package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Status;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusMasterRepository extends JpaRepository<Status, String> {
    Status findByStatusCode(String statusCode);
}
