package com.example.api.repository;

import com.example.api.models.Status;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusMasterRepository extends JpaRepository<Status, String> {
    Status findByStatusCode(String statusCode);
}
