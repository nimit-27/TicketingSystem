package com.ticketingSystem.api.service;

import com.ticketingSystem.api.enums.Mode;
import com.ticketingSystem.api.models.TicketSequence;
import com.ticketingSystem.api.repository.TicketSequenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.format.DateTimeFormatter;
import java.time.YearMonth;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TicketIdGeneratorTest {

    @Mock
    private TicketSequenceRepository ticketSequenceRepository;

    @InjectMocks
    private TicketIdGenerator ticketIdGenerator;

    @BeforeEach
    void setUp() {
        when(ticketSequenceRepository.save(any(TicketSequence.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void generateTicketId_createsSequenceWhenMissing() {
        YearMonth currentMonth = YearMonth.now();
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("GLOBAL"), any()))
                .thenReturn(Optional.empty());

        String id = ticketIdGenerator.generateTicketId(Mode.Call);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        String expectedMonth = currentMonth.format(DateTimeFormatter.ofPattern("yyyyMM"));
        assertThat(savedSequence.getModeId()).isEqualTo("GLOBAL");
        assertThat(savedSequence.getLastValue()).isEqualTo(1);
        assertThat(id).isEqualTo("TKT-2-" + expectedMonth + "-00001");
    }

    @Test
    void generateTicketId_incrementsExistingSequence() {
        TicketSequence existing = new TicketSequence();
        existing.setModeId("GLOBAL");
        existing.setSequenceDate(YearMonth.now().atDay(1));
        existing.setLastValue(5);
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("GLOBAL"), any()))
                .thenReturn(Optional.of(existing));

        String id = ticketIdGenerator.generateTicketId(Mode.Email);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        String expectedMonth = existing.getSequenceDate().format(DateTimeFormatter.ofPattern("yyyyMM"));
        assertThat(savedSequence.getModeId()).isEqualTo("GLOBAL");
        assertThat(savedSequence.getLastValue()).isEqualTo(6);
        assertThat(id).isEqualTo("TKT-3-" + expectedMonth + "-00006");
    }

    @Test
    void generateTicketId_usesFallbackWhenModeMissing() {
        YearMonth currentMonth = YearMonth.now();
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("GLOBAL"), any()))
                .thenReturn(Optional.empty());

        String id = ticketIdGenerator.generateTicketId(null);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        String expectedMonth = currentMonth.format(DateTimeFormatter.ofPattern("yyyyMM"));
        assertThat(savedSequence.getModeId()).isEqualTo("GLOBAL");
        assertThat(savedSequence.getLastValue()).isEqualTo(1);
        assertThat(id).isEqualTo("TKT-NA-" + expectedMonth + "-00001");
    }
}
