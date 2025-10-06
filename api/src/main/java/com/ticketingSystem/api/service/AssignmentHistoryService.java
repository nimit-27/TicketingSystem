package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.AssignmentHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.AssignmentHistoryRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class AssignmentHistoryService {
    private final AssignmentHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;

    public AssignmentHistory addHistory(String ticketId, String assignedBy, String assignedTo, String levelId, String remark) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        AssignmentHistory history = new AssignmentHistory();
        history.setTicket(ticket);
        history.setAssignedBy(assignedBy);
        history.setAssignedTo(assignedTo);
        history.setLevelId(levelId);
        history.setTimestamp(LocalDateTime.now());
        history.setRemark(remark);
        return historyRepository.save(history);
    }

    public List<AssignmentHistory> getHistoryForTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        return historyRepository.findByTicketOrderByTimestampAsc(ticket);
    }
}
