package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.StatusHistoryDto;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StatusHistoryService {
    private final StatusHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;
    private final StatusMasterRepository statusMasterRepository;

    public StatusHistoryService(StatusHistoryRepository historyRepository,
                                TicketRepository ticketRepository,
                                StatusMasterRepository statusMasterRepository) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
        this.statusMasterRepository = statusMasterRepository;
    }

    public StatusHistory addHistory(String ticketId, String updatedBy, String previousStatus, String currentStatus, Boolean slaFlag, String remark) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        StatusHistory history = new StatusHistory();
        history.setTicket(ticket);
        history.setUpdatedBy(updatedBy);
        history.setPreviousStatus(previousStatus);
        history.setCurrentStatus(currentStatus);
        history.setSlaFlag(slaFlag);
        history.setRemark(remark);
        return historyRepository.save(history);
    }

    public List<StatusHistoryDto> getHistoryForTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        List<StatusHistory> histories = historyRepository.findByTicketOrderByTimestampAsc(ticket);

        Set<String> statusIds = histories.stream()
                .map(StatusHistory::getCurrentStatus)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Status> statusById = statusMasterRepository.findAllById(statusIds).stream()
                .collect(Collectors.toMap(Status::getStatusId, Function.identity()));

        return histories.stream()
                .map(history -> {
                    StatusHistoryDto dto = DtoMapper.toStatusHistoryDto(history);
                    String currentStatus = dto.getCurrentStatus();
                    if (currentStatus != null) {
                        Status status = statusById.get(currentStatus);
                        if (status == null) {
                            status = statusMasterRepository.findByStatusCode(currentStatus);
                        }
                        if (status != null) {
                            dto.setStatusName(status.getStatusName());
                            dto.setLabel(status.getLabel());
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toUnmodifiableList());
    }
}
