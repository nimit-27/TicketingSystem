package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketCr;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketCrRepository extends JpaRepository<TicketCr, String> {
}
