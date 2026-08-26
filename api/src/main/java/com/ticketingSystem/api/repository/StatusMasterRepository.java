package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Status;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StatusMasterRepository extends JpaRepository<Status, String> {
    Status findByStatusCode(String statusCode);

    Status findByStatusId(String statusId);
}
