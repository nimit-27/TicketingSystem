package com.example.api.repository;

import com.example.api.models.StatusMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusMasterRepository extends JpaRepository<StatusMaster, String> {
    StatusMaster findByStatusCode(String statusCode);
}
