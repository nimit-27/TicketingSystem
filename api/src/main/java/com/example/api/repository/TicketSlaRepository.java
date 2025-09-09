package com.example.api.repository;

import com.example.api.models.TicketSla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketSlaRepository extends JpaRepository<TicketSla, String> {
}
