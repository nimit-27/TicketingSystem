package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.AssignmentHistory;
import com.ticketingSystem.api.models.DivisionHistory;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.TicketHistory;
import com.ticketingSystem.api.repository.AssignmentHistoryRepository;
import com.ticketingSystem.api.repository.DivisionHistoryRepository;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.TicketHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketHistoryBackfillService {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");
    private static final String STATUS_HISTORY_SOURCE = "status_history";
    private static final String DIVISION_HISTORY_SOURCE = "division_history";
    private static final String ASSIGNMENT_HISTORY_SOURCE = "assignment_history";

    private final TicketHistoryRepository ticketHistoryRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final DivisionHistoryRepository divisionHistoryRepository;
    private final AssignmentHistoryRepository assignmentHistoryRepository;

    @Transactional
    public Map<String, Integer> backfillLegacyHistory() {
        Map<String, Integer> counts = new HashMap<>();
        counts.put(STATUS_HISTORY_SOURCE, backfillStatusHistory());
        counts.put(DIVISION_HISTORY_SOURCE, backfillDivisionHistory());
        counts.put(ASSIGNMENT_HISTORY_SOURCE, backfillAssignmentHistory());
        counts.put("total", counts.values().stream().mapToInt(Integer::intValue).sum());
        return counts;
    }

    private int backfillStatusHistory() {
        List<TicketHistory> rows = new ArrayList<>();
        for (StatusHistory history : statusHistoryRepository.findAll()) {
            if (history == null || history.getId() == null || history.getTicket() == null) continue;
            if (exists(STATUS_HISTORY_SOURCE, history.getId(), "status_id")) continue;
            rows.add(createHistoryRow(
                    history.getTicket().getId(),
                    "status_history:" + history.getId(),
                    "status_id",
                    "STATUS_UPDATE",
                    "Status Updated",
                    history.getPreviousStatus(),
                    history.getCurrentStatus(),
                    history.getUpdatedBy(),
                    history.getTimestamp(),
                    history.getTimestampUtc(),
                    history.getRemark(),
                    STATUS_HISTORY_SOURCE,
                    history.getId(),
                    "status_id"
            ));
        }
        ticketHistoryRepository.saveAll(rows);
        return rows.size();
    }

    private int backfillDivisionHistory() {
        List<TicketHistory> rows = new ArrayList<>();
        for (DivisionHistory history : divisionHistoryRepository.findAll()) {
            if (history == null || history.getId() == null || history.getTicket() == null) continue;
            if (exists(DIVISION_HISTORY_SOURCE, history.getId(), "division")) continue;
            rows.add(createHistoryRow(
                    history.getTicket().getId(),
                    "division_history:" + history.getId(),
                    "division",
                    "DIVISION_UPDATE",
                    "Division Updated",
                    history.getPreviousDivision(),
                    history.getCurrentDivision(),
                    history.getUpdatedBy(),
                    history.getTimestamp(),
                    null,
                    history.getRemark(),
                    DIVISION_HISTORY_SOURCE,
                    history.getId(),
                    "division"
            ));
        }
        ticketHistoryRepository.saveAll(rows);
        return rows.size();
    }

    private int backfillAssignmentHistory() {
        List<AssignmentHistory> histories = new ArrayList<>(assignmentHistoryRepository.findAll());
        histories.sort(Comparator
                .comparing((AssignmentHistory h) -> h.getTicket() != null ? h.getTicket().getId() : "")
                .thenComparing(AssignmentHistory::getTimestamp, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(AssignmentHistory::getId, Comparator.nullsLast(Comparator.naturalOrder())));

        Map<String, String> previousAssigneeByTicket = new HashMap<>();
        Map<String, String> previousLevelByTicket = new HashMap<>();
        List<TicketHistory> rows = new ArrayList<>();
        for (AssignmentHistory history : histories) {
            if (history == null || history.getId() == null || history.getTicket() == null) continue;
            String ticketId = history.getTicket().getId();
            String previousAssignee = previousAssigneeByTicket.get(ticketId);
            String previousLevel = previousLevelByTicket.get(ticketId);

            if (!exists(ASSIGNMENT_HISTORY_SOURCE, history.getId(), "assigned_to")) {
                rows.add(createHistoryRow(
                        ticketId,
                        "assignment_history:" + history.getId(),
                        "assigned_to",
                        "ASSIGNED_TO_UPDATE",
                        "Assigned To Updated",
                        previousAssignee,
                        history.getAssignedTo(),
                        history.getAssignedBy(),
                        history.getTimestamp(),
                        null,
                        history.getRemark(),
                        ASSIGNMENT_HISTORY_SOURCE,
                        history.getId(),
                        "assigned_to"
                ));
            }

            if (history.getLevelId() != null && !history.getLevelId().isBlank()
                    && !exists(ASSIGNMENT_HISTORY_SOURCE, history.getId(), "level_id")) {
                rows.add(createHistoryRow(
                        ticketId,
                        "assignment_history:" + history.getId(),
                        "level_id",
                        "LEVEL_UPDATE",
                        "Level Updated",
                        previousLevel,
                        history.getLevelId(),
                        history.getAssignedBy(),
                        history.getTimestamp(),
                        null,
                        history.getRemark(),
                        ASSIGNMENT_HISTORY_SOURCE,
                        history.getId(),
                        "level_id"
                ));
            }

            previousAssigneeByTicket.put(ticketId, history.getAssignedTo());
            previousLevelByTicket.put(ticketId, history.getLevelId());
        }
        ticketHistoryRepository.saveAll(rows);
        return rows.size();
    }

    private boolean exists(String sourceTable, String sourceHistoryId, String sourceColumnName) {
        return ticketHistoryRepository.existsBySourceTableAndSourceHistoryIdAndSourceColumnName(
                sourceTable,
                sourceHistoryId,
                sourceColumnName
        );
    }

    private TicketHistory createHistoryRow(String ticketId,
                                           String updateGroupId,
                                           String columnName,
                                           String updateTypeCode,
                                           String displayLabel,
                                           String oldValue,
                                           String newValue,
                                           String updatedBy,
                                           LocalDateTime updatedOn,
                                           Instant updatedOnUtc,
                                           String remarks,
                                           String sourceTable,
                                           String sourceHistoryId,
                                           String sourceColumnName) {
        Instant resolvedUpdatedOnUtc = updatedOnUtc != null
                ? updatedOnUtc
                : (updatedOn != null ? updatedOn.atZone(BUSINESS_ZONE).toInstant() : Instant.now());
        LocalDateTime resolvedUpdatedOn = updatedOn != null
                ? updatedOn
                : LocalDateTime.ofInstant(resolvedUpdatedOnUtc, BUSINESS_ZONE);

        TicketHistory row = new TicketHistory();
        row.setUpdateGroupId(updateGroupId);
        row.setTicketId(ticketId);
        row.setColumnName(columnName);
        row.setUpdateTypeCode(updateTypeCode);
        row.setDisplayLabel(displayLabel);
        row.setOldValue(oldValue);
        row.setNewValue(newValue);
        row.setUpdatedBy(updatedBy != null && !updatedBy.isBlank() ? updatedBy : "SYSTEM");
        row.setUpdatedOn(resolvedUpdatedOn);
        row.setUpdatedOnUtc(resolvedUpdatedOnUtc);
        row.setRemarks(remarks);
        row.setSourceTable(sourceTable);
        row.setSourceHistoryId(sourceHistoryId);
        row.setSourceColumnName(sourceColumnName);
        return row;
    }
}
