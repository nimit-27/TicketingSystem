package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RegionMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionMasterRepository extends JpaRepository<RegionMaster, String> {
}
