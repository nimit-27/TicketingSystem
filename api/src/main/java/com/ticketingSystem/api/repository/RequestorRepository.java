package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Requestor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestorRepository extends JpaRepository<Requestor, String> {
}
