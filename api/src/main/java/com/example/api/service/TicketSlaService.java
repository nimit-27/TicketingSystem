package com.example.api.service;

import com.example.api.models.SlaConfig;
import com.example.api.models.StatusHistory;
import com.example.api.models.Ticket;
import com.example.api.models.TicketSla;
import com.example.api.repository.SlaConfigRepository;
import com.example.api.repository.StatusHistoryRepository;
import com.example.api.repository.TicketSlaRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class TicketSlaService {
    private final SlaConfigRepository slaConfigRepository;
    private final TicketSlaRepository ticketSlaRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public TicketSlaService(SlaConfigRepository slaConfigRepository,
                            TicketSlaRepository ticketSlaRepository,
                            StatusHistoryRepository statusHistoryRepository) {
        this.slaConfigRepository = slaConfigRepository;
        this.ticketSlaRepository = ticketSlaRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    public TicketSla calculateAndSave(Ticket ticket, List<StatusHistory> history) {
        if (ticket == null) return null;
        SlaConfig config = slaConfigRepository.findBySeverityLevel(ticket.getSeverity())
                .orElse(null);
        if (config == null) {
            throw new IllegalStateException("SLA configuration not found for severity: " + ticket.getSeverity());
        }
        long resolutionPolicy = config.getResolutionMinutes() != null
                ? config.getResolutionMinutes() : 0L;
        LocalDateTime dueAt = ticket.getReportedDate().plusMinutes(resolutionPolicy);

        history.sort(Comparator.comparing(StatusHistory::getTimestamp));
        LocalDateTime assignTime = history.isEmpty() ? ticket.getReportedDate() : history.get(0).getTimestamp();
        long responseMinutes = Duration.between(ticket.getReportedDate(), assignTime).toMinutes();

        long elapsed = 0L;
        long resolution = 0L;
        LocalDateTime prevTime = assignTime;
        Boolean prevFlag = history.isEmpty() ? Boolean.TRUE : history.get(0).getSlaFlag();
        for (int i = 1; i < history.size(); i++) {
            StatusHistory sh = history.get(i);
            long diff = Duration.between(prevTime, sh.getTimestamp()).toMinutes();
            
            elapsed += diff;

            if (Boolean.TRUE.equals(prevFlag)) resolution += diff;
            else dueAt = dueAt.plusMinutes(diff);

            prevTime = sh.getTimestamp();
            prevFlag = sh.getSlaFlag();
        }
        LocalDateTime endTime = ticket.getResolvedAt() != null ? ticket.getResolvedAt() : LocalDateTime.now();
        long finalDiff = Duration.between(prevTime, endTime).toMinutes();
        elapsed += finalDiff;
        if (Boolean.TRUE.equals(prevFlag)) {
            resolution += finalDiff;
        } else {
            dueAt = dueAt.plusMinutes(finalDiff);
        }
        long breachedBy = Duration.between(dueAt, endTime).toMinutes();

        TicketSla ticketSla = ticketSlaRepository.findByTicket_Id(ticket.getId())
                .orElseGet(TicketSla::new);
        ticketSla.setTicket(ticket);
        ticketSla.setSlaConfig(config);
        ticketSla.setDueAt(dueAt);
        ticketSla.setResolutionTimeMinutes(resolution);
        ticketSla.setElapsedTimeMinutes(elapsed);
        ticketSla.setResponseTimeMinutes(responseMinutes);
        ticketSla.setBreachedByMinutes(breachedBy);
        ticketSla.setCreatedAt(ticket.getReportedDate());
        if (ticket.getReportedDate() != null && dueAt != null) {
            ticketSla.setTotalSlaMinutes(Duration.between(ticket.getReportedDate(), dueAt).toMinutes());
        } else {
            ticketSla.setTotalSlaMinutes(null);
        }
        return ticketSlaRepository.save(ticketSla);
    }

    public TicketSla getByTicketId(String ticketId) {
        return ticketSlaRepository.findByTicket_Id(ticketId)
                .map(existing -> {
                    Ticket ticket = existing.getTicket();
                    if (ticket == null) {
                        return existing;
                    }
                    List<StatusHistory> history = statusHistoryRepository.findByTicketOrderByTimestampAsc(ticket);
                    TicketSla refreshed = calculateAndSave(ticket, history);
                    if (refreshed.getCreatedAt() == null) {
                        refreshed.setCreatedAt(ticket.getReportedDate());
                    }
                    if (refreshed.getTotalSlaMinutes() == null && ticket.getReportedDate() != null && refreshed.getDueAt() != null) {
                        refreshed.setTotalSlaMinutes(Duration.between(ticket.getReportedDate(), refreshed.getDueAt()).toMinutes());
                    }
                    return refreshed;
                })
                .orElse(null);
    }
}
