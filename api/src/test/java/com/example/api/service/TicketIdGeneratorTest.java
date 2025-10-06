package com.example.api.service;

import com.example.api.enums.Mode;
import com.example.api.models.TicketSequence;
import com.example.api.repository.TicketSequenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
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
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("GLOBAL"), any()))
                .thenReturn(Optional.empty());

        String id = ticketIdGenerator.generateTicketId(Mode.Call);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        YearMonth currentMonth = YearMonth.now();
        LocalDate expectedSequenceDate = currentMonth.atDay(1);
        String expectedMonth = currentMonth.format(DateTimeFormatter.ofPattern("yyyyMM"));
        assertThat(savedSequence.getModeId()).isEqualTo("GLOBAL");
        assertThat(savedSequence.getSequenceDate()).isEqualTo(expectedSequenceDate);
        assertThat(savedSequence.getLastValue()).isEqualTo(1);
        assertThat(id).isEqualTo("TKT-2-" + expectedMonth + "-00001");
    }

    @Test
    void generateTicketId_incrementsExistingSequence() {
        TicketSequence existing = new TicketSequence();
        YearMonth currentMonth = YearMonth.now();
        existing.setModeId("GLOBAL");
        existing.setSequenceDate(currentMonth.atDay(1));
        existing.setLastValue(5);
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("GLOBAL"), any()))
                .thenReturn(Optional.of(existing));

        String id = ticketIdGenerator.generateTicketId(Mode.Email);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        String expectedMonth = currentMonth.format(DateTimeFormatter.ofPattern("yyyyMM"));
        assertThat(savedSequence.getModeId()).isEqualTo("GLOBAL");
        assertThat(savedSequence.getSequenceDate()).isEqualTo(currentMonth.atDay(1));
        assertThat(savedSequence.getLastValue()).isEqualTo(6);
        assertThat(id).isEqualTo("TKT-3-" + expectedMonth + "-00006");
    }

    @Test
    void generateTicketId_usesFallbackWhenModeMissing() {
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("GLOBAL"), any()))
                .thenReturn(Optional.empty());

        String id = ticketIdGenerator.generateTicketId(null);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        YearMonth currentMonth = YearMonth.now();
        String expectedMonth = currentMonth.format(DateTimeFormatter.ofPattern("yyyyMM"));
        assertThat(savedSequence.getModeId()).isEqualTo("GLOBAL");
        assertThat(savedSequence.getSequenceDate()).isEqualTo(currentMonth.atDay(1));
        assertThat(savedSequence.getLastValue()).isEqualTo(1);
        assertThat(id).isEqualTo("TKT-NA-" + expectedMonth + "-00001");
    }
}
