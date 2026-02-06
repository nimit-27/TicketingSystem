package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RegionMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegionMasterRepository extends JpaRepository<RegionMaster, String> {
    List<RegionMaster> findByZoneCodeOrderByRegionNameAsc(String zoneCode);
}
