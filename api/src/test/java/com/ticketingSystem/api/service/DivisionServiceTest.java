package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.DivisionMaster;
import com.ticketingSystem.api.repository.DivisionMasterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DivisionServiceTest {

    @Mock
    private DivisionMasterRepository divisionMasterRepository;

    @InjectMocks
    private DivisionService service;

    @Test
    void getAllActiveShouldOnlyRequestActiveFlagValue() {
        List<DivisionMaster> active = List.of(new DivisionMaster());
        when(divisionMasterRepository.findByIsActive("1")).thenReturn(active);

        List<DivisionMaster> result = service.getAllActive();

        verify(divisionMasterRepository).findByIsActive("1");
        assertThat(result).containsExactlyElementsOf(active);
    }
}
