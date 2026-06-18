package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.CrStatusMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CrStatusMasterRepository extends JpaRepository<CrStatusMaster, String> {
    Optional<CrStatusMaster> findByCrStatusCodeIgnoreCase(String crStatusCode);
}
