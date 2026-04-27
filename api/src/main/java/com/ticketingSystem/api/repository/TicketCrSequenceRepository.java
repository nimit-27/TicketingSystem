package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketCrSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.time.LocalDate;
import java.util.Optional;

public interface TicketCrSequenceRepository extends JpaRepository<TicketCrSequence, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TicketCrSequence> findBySequenceDate(LocalDate sequenceDate);
}
