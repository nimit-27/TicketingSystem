package com.example.api.service;

import com.example.api.enums.Mode;
import com.example.api.models.TicketSequence;
import com.example.api.repository.TicketSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TicketIdGenerator {

    private static final String ID_PREFIX = "TKT";
    private static final String UNKNOWN_MODE = "NA";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final TicketSequenceRepository ticketSequenceRepository;

    @Transactional
    public String generateTicketId(Mode mode) {
        String modeId = resolveModeId(mode);
        LocalDate today = LocalDate.now();

        TicketSequence sequence = ticketSequenceRepository
                .findByModeIdAndSequenceDate(modeId, today)
                .orElseGet(() -> {
                    TicketSequence created = new TicketSequence();
                    created.setModeId(modeId);
                    created.setSequenceDate(today);
                    created.setLastValue(0);
                    return created;
                });

        long nextValue = sequence.getLastValue() + 1;
        sequence.setLastValue(nextValue);
        ticketSequenceRepository.save(sequence);

        return String.format("%s-%s-%s-%d", ID_PREFIX, modeId, DATE_FORMATTER.format(today), nextValue);
    }

    private String resolveModeId(Mode mode) {
        if (mode == null) {
            return UNKNOWN_MODE;
        }
        return mode.name().toUpperCase();
    }
}
