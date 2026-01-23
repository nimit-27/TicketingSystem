package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueTypeRepository extends JpaRepository<IssueType, String> {
}
