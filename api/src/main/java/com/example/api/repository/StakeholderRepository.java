package com.example.api.repository;

import com.example.api.models.Stakeholder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StakeholderRepository extends JpaRepository<Stakeholder, Integer> {
}
