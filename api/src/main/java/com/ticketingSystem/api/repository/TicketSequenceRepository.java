package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TicketSequenceRepository extends JpaRepository<TicketSequence, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TicketSequence> findByModeIdAndSequenceDate(String modeId, LocalDate sequenceDate);
}
