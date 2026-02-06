package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.DistrictMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DistrictMasterRepository extends JpaRepository<DistrictMaster, String> {
    List<DistrictMaster> findByHrmsRegCodeOrderByDistrictNameAsc(String hrmsRegCode);
}
