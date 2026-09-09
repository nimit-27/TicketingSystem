package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.sla.TicketSlaRecalculationPreviewDto;
import com.ticketingSystem.api.dto.TicketSlaDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

@Service
public class TicketSlaRecalculationService {
    private final TicketRepository ticketRepository;
    private final TicketSlaRepository ticketSlaRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final StatusMasterService statusMasterService;
    private final TicketSlaService ticketSlaService;

    public TicketSlaRecalculationService(TicketRepository ticketRepository,
                                         TicketSlaRepository ticketSlaRepository,
                                         StatusHistoryRepository statusHistoryRepository,
                                         StatusMasterService statusMasterService,
                                         TicketSlaService ticketSlaService) {
        this.ticketRepository = ticketRepository;
        this.ticketSlaRepository = ticketSlaRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.statusMasterService = statusMasterService;
        this.ticketSlaService = ticketSlaService;
    }

    @Transactional
    public List<TicketSlaRecalculationPreviewDto> recalculate(List<String> ticketIds, boolean apply) {
        if (ticketIds == null || ticketIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one ticket ID is required");
        }
        List<String> uniqueIds = new LinkedHashSet<>(ticketIds).stream()
                .filter(Objects::nonNull).map(String::trim).filter(id -> !id.isEmpty()).toList();
        if (uniqueIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one ticket ID is required");
        }
        return uniqueIds.stream().map(id -> recalculateOne(id, apply)).toList();
    }

    private TicketSlaRecalculationPreviewDto recalculateOne(String ticketId, boolean apply) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found: " + ticketId));
        TicketSla stored = ticketSlaRepository.findByTicket_Id(ticketId).orElse(null);
        TicketSlaDto storedSnapshot = stored == null ? null : DtoMapper.toTicketSlaDto(stored);
        List<StatusHistory> history = statusHistoryRepository.findByTicketOrderByTimestampAsc(ticket);

        int changed = 0;
        for (StatusHistory row : history) {
            Boolean masterFlag = statusMasterService.getSlaFlagByStatusId(row.getCurrentStatus());
            if (!Objects.equals(row.getSlaFlag(), masterFlag)) {
                row.setSlaFlag(masterFlag);
                changed++;
            }
        }
        if (changed > 0) {
            statusHistoryRepository.saveAll(history);
        }

        TicketSla calculated = apply
                ? ticketSlaService.calculateAndSaveByCalendarFromScratch(ticket, history)
                : ticketSlaService.calculateByCalendarFromScratch(ticket, history);
        return new TicketSlaRecalculationPreviewDto(
                ticketId,
                storedSnapshot,
                DtoMapper.toTicketSlaDto(calculated),
                changed,
                apply);
    }
}
