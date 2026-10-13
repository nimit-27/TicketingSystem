package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketHistory;
import com.ticketingSystem.api.repository.TicketHistoryConfigRepository;
import com.ticketingSystem.api.repository.TicketHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/** Records timestamp changes made outside the general ticket update workflow. */
@Service
@RequiredArgsConstructor
public class TicketTimestampHistoryService {
    private final TicketHistoryConfigRepository configRepository;
    private final TicketHistoryRepository historyRepository;

    public Map<String, String> snapshot(Ticket ticket) {
        Map<String, String> values = new HashMap<>();
        values.put("resolved_at", value(ticket.getResolvedAt()));
        values.put("resolved_at_utc", value(ticket.getResolvedAtUtc()));
        values.put("closed_at", value(ticket.getClosedAt()));
        values.put("closed_at_utc", value(ticket.getClosedAtUtc()));
        return values;
    }

    public void recordChanges(Map<String, String> before, Ticket ticket, String actor, String remark) {
        Map<String, String> after = snapshot(ticket);
        List<TicketHistory> rows = new ArrayList<>();
        String group = UUID.randomUUID().toString();
        Instant now = Instant.now();
        for (var config : configRepository.findByTableNameAndIsTrackableTrueOrderByDisplayOrderAsc("tickets")) {
            String column = config.getColumnName();
            if (!after.containsKey(column) || Objects.equals(before.get(column), after.get(column))) continue;
            TicketHistory row = new TicketHistory();
            row.setTicketId(ticket.getId());
            row.setUpdateGroupId(group);
            row.setColumnName(column);
            row.setUpdateTypeCode(config.getUpdateTypeCode());
            row.setDisplayLabel(config.getDisplayLabel());
            row.setOldValue(before.get(column));
            row.setNewValue(after.get(column));
            row.setUpdatedBy(actor == null || actor.isBlank() ? "SYSTEM" : actor);
            row.setUpdatedOnUtc(now);
            row.setUpdatedOn(LocalDateTime.ofInstant(now, ZoneId.of("Asia/Kolkata")));
            row.setRemarks(remark);
            rows.add(row);
        }
        if (!rows.isEmpty()) historyRepository.saveAll(rows);
    }

    private String value(Object value) {
        return value == null ? null : value.toString();
    }
}
