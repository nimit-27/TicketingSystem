package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.HeadquarterMaster;
import com.ticketingSystem.api.repository.HeadquarterMasterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HeadquarterMasterServiceTest {

    @Mock
    private HeadquarterMasterRepository repository;

    @InjectMocks
    private HeadquarterMasterService service;

    @Test
    void getAllShouldDelegateToRepository() {
        HeadquarterMaster one = new HeadquarterMaster();
        one.setHeadquarterCode("H1");
        when(repository.findAll()).thenReturn(List.of(one));

        assertThat(service.getAll()).containsExactly(one);
    }
}
