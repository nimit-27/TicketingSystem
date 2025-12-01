package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Stakeholder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StakeholderRepository extends JpaRepository<Stakeholder, Integer> {
    java.util.List<Stakeholder> findByStakeholderGroupId(Integer stakeholderGroupId);
}
