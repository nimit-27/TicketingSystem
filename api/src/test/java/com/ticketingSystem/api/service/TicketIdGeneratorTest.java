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
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("2"), any()))
                .thenReturn(Optional.empty());

        String id = ticketIdGenerator.generateTicketId(Mode.Call);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        String expectedDate = savedSequence.getSequenceDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        assertThat(savedSequence.getModeId()).isEqualTo("2");
        assertThat(savedSequence.getLastValue()).isEqualTo(1);
        assertThat(id).isEqualTo("TKT-2-" + expectedDate + "-1");
    }

    @Test
    void generateTicketId_incrementsExistingSequence() {
        TicketSequence existing = new TicketSequence();
        existing.setModeId("3");
        existing.setSequenceDate(java.time.LocalDate.now());
        existing.setLastValue(5);
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("3"), any()))
                .thenReturn(Optional.of(existing));

        String id = ticketIdGenerator.generateTicketId(Mode.Email);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        String expectedDate = savedSequence.getSequenceDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        assertThat(savedSequence.getModeId()).isEqualTo("3");
        assertThat(savedSequence.getLastValue()).isEqualTo(6);
        assertThat(id).isEqualTo("TKT-3-" + expectedDate + "-6");
    }

    @Test
    void generateTicketId_usesFallbackWhenModeMissing() {
        when(ticketSequenceRepository.findByModeIdAndSequenceDate(eq("NA"), any()))
                .thenReturn(Optional.empty());

        String id = ticketIdGenerator.generateTicketId(null);

        ArgumentCaptor<TicketSequence> sequenceCaptor = ArgumentCaptor.forClass(TicketSequence.class);
        verify(ticketSequenceRepository).save(sequenceCaptor.capture());

        TicketSequence savedSequence = sequenceCaptor.getValue();
        String expectedDate = savedSequence.getSequenceDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        assertThat(savedSequence.getModeId()).isEqualTo("NA");
        assertThat(savedSequence.getLastValue()).isEqualTo(1);
        assertThat(id).isEqualTo("TKT-NA-" + expectedDate + "-1");
    }
}
