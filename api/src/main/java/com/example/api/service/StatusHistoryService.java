package com.example.api.service;

import com.example.api.dto.StatusHistoryDto;
import com.example.api.enums.TicketStatus;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.StatusHistory;
import com.example.api.models.Ticket;
import com.example.api.repository.StatusHistoryRepository;
import com.example.api.repository.TicketRepository;
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

    public StatusHistory addHistory(String ticketId, String updatedBy, TicketStatus previousStatus, TicketStatus currentStatus, Boolean slaFlag) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        StatusHistory history = new StatusHistory();
        history.setTicket(ticket);
        history.setUpdatedBy(updatedBy);
        history.setPreviousStatus(previousStatus);
        history.setCurrentStatus(currentStatus);
        history.setTimestamp(LocalDateTime.now());
        history.setSlaFlag(slaFlag);
        return historyRepository.save(history);
    }

    public List<StatusHistoryDto> getHistoryForTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        return historyRepository.findByTicketOrderByTimestampAsc(ticket).stream().map(DtoMapper::toStatusHistoryDto).collect(Collectors.toUnmodifiableList());
    }
}
