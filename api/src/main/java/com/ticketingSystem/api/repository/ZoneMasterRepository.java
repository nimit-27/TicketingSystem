package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.ZoneMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZoneMasterRepository extends JpaRepository<ZoneMaster, String> {
}
