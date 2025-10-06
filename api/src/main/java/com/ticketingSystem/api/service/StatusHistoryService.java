package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.StatusHistoryDto;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatusHistoryService {
    private final StatusHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;

    public StatusHistoryService(StatusHistoryRepository historyRepository, TicketRepository ticketRepository) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
    }

    public StatusHistory addHistory(String ticketId, String updatedBy, String previousStatus, String currentStatus, Boolean slaFlag, String remark) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        StatusHistory history = new StatusHistory();
        history.setTicket(ticket);
        history.setUpdatedBy(updatedBy);
        history.setPreviousStatus(previousStatus);
        history.setCurrentStatus(currentStatus);
        history.setTimestamp(LocalDateTime.now());
        history.setSlaFlag(slaFlag);
        history.setRemark(remark);
        return historyRepository.save(history);
    }

    public List<StatusHistoryDto> getHistoryForTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        return historyRepository.findByTicketOrderByTimestampAsc(ticket).stream().map(DtoMapper::toStatusHistoryDto).collect(Collectors.toUnmodifiableList());
    }
}
