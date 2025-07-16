package com.example.api.repository;

import com.example.api.models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    public List<Ticket> findByIsMasterTrue();

    public List<Ticket> findByLastModifiedAfter(LocalDateTime lastSyncedTime);
}
