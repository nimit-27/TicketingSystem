package com.ticketingSystem.api.service;

import com.ticketingSystem.api.enums.Mode;
import com.ticketingSystem.api.models.TicketSequence;
import com.ticketingSystem.api.repository.TicketSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TicketIdGenerator {

    private static final String ID_PREFIX = "TKT";
    private static final String UNKNOWN_MODE = "NA";
    private static final String SEQUENCE_SCOPE_MODE_ID = "GLOBAL";
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");
    private static final int COUNTER_LENGTH = 5;

    private final TicketSequenceRepository ticketSequenceRepository;

    @Transactional
    public String generateTicketId(Mode mode) {
        String modeId = resolveModeId(mode);
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);

        TicketSequence sequence = ticketSequenceRepository
                .findByModeIdAndSequenceDate(SEQUENCE_SCOPE_MODE_ID, monthStart)
                .orElseGet(() -> {
                    TicketSequence created = new TicketSequence();
                    created.setModeId(SEQUENCE_SCOPE_MODE_ID);
                    created.setSequenceDate(monthStart);
                    created.setLastValue(0);
                    return created;
                });

        long nextValue = sequence.getLastValue() + 1;
        sequence.setLastValue(nextValue);
        ticketSequenceRepository.save(sequence);

        return String.format("%s-%s-%s-%s",
                ID_PREFIX,
                modeId,
                currentMonth.format(MONTH_FORMATTER),
                formatCounter(nextValue));
    }

    private String resolveModeId(Mode mode) {
        if (mode == null) {
            return UNKNOWN_MODE;
        }
        return mode.getId();
    }

    private String formatCounter(long sequenceNumber) {
        return String.format("%0" + COUNTER_LENGTH + "d", sequenceNumber);
    }
}
