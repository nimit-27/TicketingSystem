package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.DivisionMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DivisionMasterRepository extends JpaRepository<DivisionMaster, String> {
    List<DivisionMaster> findByIsActive(String isActive);
}
