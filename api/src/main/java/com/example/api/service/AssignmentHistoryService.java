package com.example.api.service;

import com.example.api.models.AssignmentHistory;
import com.example.api.models.Ticket;
import com.example.api.repository.AssignmentHistoryRepository;
import com.example.api.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentHistoryService {
    private final AssignmentHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;

    public AssignmentHistoryService(AssignmentHistoryRepository historyRepository, TicketRepository ticketRepository) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
    }

    public AssignmentHistory addHistory(int ticketId, String assignedBy, String assignedTo) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        AssignmentHistory history = new AssignmentHistory();
        history.setTicket(ticket);
        history.setAssignedBy(assignedBy);
        history.setAssignedTo(assignedTo);
        history.setTimestamp(LocalDateTime.now());
        return historyRepository.save(history);
    }

    public List<AssignmentHistory> getHistoryForTicket(int ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        return historyRepository.findByTicketOrderByTimestampAsc(ticket);
    }
}
