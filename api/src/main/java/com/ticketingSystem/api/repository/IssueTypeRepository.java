package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IssueTypeRepository extends JpaRepository<IssueType, String> {
    List<IssueType> findByIsActive(String isActive);

    Optional<IssueType> findFirstByIssueTypeLabelIgnoreCase(String issueTypeLabel);
}
