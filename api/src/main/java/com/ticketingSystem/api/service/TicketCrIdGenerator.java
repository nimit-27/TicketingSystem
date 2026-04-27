package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.TicketCrSequence;
import com.ticketingSystem.api.repository.TicketCrSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TicketCrIdGenerator {

    private static final String ID_PREFIX = "CR";
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");
    private static final int COUNTER_LENGTH = 5;

    private final TicketCrSequenceRepository ticketCrSequenceRepository;

    @Transactional
    public String generateTicketCrId() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);

        TicketCrSequence sequence = ticketCrSequenceRepository
                .findBySequenceDate(monthStart)
                .orElseGet(() -> {
                    TicketCrSequence created = new TicketCrSequence();
                    created.setSequenceDate(monthStart);
                    created.setLastValue(0);
                    return created;
                });

        long nextValue = sequence.getLastValue() + 1;
        sequence.setLastValue(nextValue);
        ticketCrSequenceRepository.save(sequence);

        return String.format("%s-%s-%s", ID_PREFIX, currentMonth.format(MONTH_FORMATTER), formatCounter(nextValue));
    }

    private String formatCounter(long sequenceNumber) {
        return String.format("%0" + COUNTER_LENGTH + "d", sequenceNumber);
    }
}
