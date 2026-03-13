package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.PageMasterDto;
import com.ticketingSystem.api.models.PageMaster;
import com.ticketingSystem.api.repository.PageMasterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PageMasterServiceTest {

    @Mock
    private PageMasterRepository pageMasterRepository;

    @InjectMocks
    private PageMasterService service;

    @Test
    void getAllPagesShouldMapRepositoryResults() {
        PageMaster page = new PageMaster();
        page.setPageId(1L);
        page.setPageName("Dashboard");
        when(pageMasterRepository.findAll()).thenReturn(List.of(page));

        List<PageMasterDto> result = service.getAllPages();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPageId()).isEqualTo(1L);
        assertThat(result.get(0).getPageName()).isEqualTo("Dashboard");
    }

    @Test
    void getActiveMethodsShouldOnlyUseMatchingRepositoryQueries() {
        PageMaster active = new PageMaster();
        active.setPageId(2L);
        active.setPageName("Tickets");

        when(pageMasterRepository.findByIsActiveTrue()).thenReturn(List.of(active));
        when(pageMasterRepository.findByIsActiveTrueAndIsOnSidebarTrue()).thenReturn(List.of(active));

        assertThat(service.getActivePages()).extracting(PageMasterDto::getPageId).containsExactly(2L);
        assertThat(service.getActiveSidebarPages()).extracting(PageMasterDto::getPageName).containsExactly("Tickets");
    }

    @Test
    void getPageByIdShouldReturnMappedDtoOrEmpty() {
        PageMaster page = new PageMaster();
        page.setPageId(7L);
        page.setPageCode("REPORTS");
        when(pageMasterRepository.findById(7L)).thenReturn(Optional.of(page));
        when(pageMasterRepository.findById(8L)).thenReturn(Optional.empty());

        assertThat(service.getPageById(7L)).isPresent();
        assertThat(service.getPageById(7L).get().getPageCode()).isEqualTo("REPORTS");
        assertThat(service.getPageById(8L)).isEmpty();
    }
}
