package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketCr;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketCrRepository extends JpaRepository<TicketCr, String> {
    boolean existsByTicket_Id(String ticketId);
    Optional<TicketCr> findByTicket_Id(String ticketId);
}
