package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.PageMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PageMasterRepository extends JpaRepository<PageMaster, Long> {
    List<PageMaster> findByIsActiveTrue();

    List<PageMaster> findByIsActiveTrueAndIsOnSidebarTrue();
}
