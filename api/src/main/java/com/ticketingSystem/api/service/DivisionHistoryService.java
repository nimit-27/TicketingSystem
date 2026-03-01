package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.DivisionHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.DivisionHistoryRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DivisionHistoryService {
    private final DivisionHistoryRepository divisionHistoryRepository;
    private final TicketRepository ticketRepository;

    public DivisionHistory addHistory(String ticketId, String updatedBy, String previousDivision, String currentDivision, String remark) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        DivisionHistory history = new DivisionHistory();
        history.setTicket(ticket);
        history.setUpdatedBy(updatedBy);
        history.setPreviousDivision(previousDivision);
        history.setCurrentDivision(currentDivision);
        history.setRemark(remark);
        history.setTimestamp(LocalDateTime.now());
        return divisionHistoryRepository.save(history);
    }
}
