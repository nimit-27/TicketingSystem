package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.DistrictMaster;
import com.ticketingSystem.api.repository.DistrictMasterRepository;
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
class DistrictMasterServiceTest {

    @Mock
    private DistrictMasterRepository repository;

    @InjectMocks
    private DistrictMasterService service;

    @Test
    void getAllShouldReturnRepositoryResults() {
        List<DistrictMaster> districts = List.of(new DistrictMaster(), new DistrictMaster());
        when(repository.findAll()).thenReturn(districts);

        assertThat(service.getAll()).containsExactlyElementsOf(districts);
    }

    @Test
    void getByHrmsRegCodeShouldDelegateSortedLookup() {
        List<DistrictMaster> districts = List.of(new DistrictMaster());
        when(repository.findByHrmsRegCodeOrderByDistrictNameAsc("REG-1")).thenReturn(districts);

        List<DistrictMaster> result = service.getByHrmsRegCode("REG-1");

        verify(repository).findByHrmsRegCodeOrderByDistrictNameAsc("REG-1");
        assertThat(result).containsExactlyElementsOf(districts);
    }
}
