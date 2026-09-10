package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.StatusHistoryDto;
import com.ticketingSystem.api.dto.StatusTimestampUpdateRequest;
import com.ticketingSystem.api.dto.StatusTimestampPreviewDto;
import com.ticketingSystem.api.exception.ForbiddenOperationException;
import com.ticketingSystem.api.service.StatusHistoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatusHistoryControllerTest {

    @Mock
    private StatusHistoryService historyService;

    @Test
    void updateTimestampIsAvailableInUiDevModeRegardlessOfDeploymentProfile() {
        StatusHistoryController controller = new StatusHistoryController(historyService);
        StatusTimestampUpdateRequest request = new StatusTimestampUpdateRequest(null, 30L);
        StatusHistoryDto expected = new StatusHistoryDto();
        when(historyService.updateTimestamp("history-1", request)).thenReturn(expected);

        StatusHistoryDto actual = controller.updateTimestamp("history-1", true, request).getBody();

        assertSame(expected, actual);
        verify(historyService).updateTimestamp("history-1", request);
    }

    @Test
    void updateTimestampRequiresUiDevMode() {
        StatusHistoryController controller = new StatusHistoryController(historyService);
        StatusTimestampUpdateRequest request = new StatusTimestampUpdateRequest(
                LocalDateTime.of(2026, 9, 10, 10, 0), null);

        assertThrows(ForbiddenOperationException.class,
                () -> controller.updateTimestamp("history-1", false, request));
        verifyNoInteractions(historyService);
    }

    @Test
    void previewTimestampIsAvailableInUiDevMode() {
        StatusHistoryController controller = new StatusHistoryController(historyService);
        StatusTimestampUpdateRequest request = new StatusTimestampUpdateRequest(
                LocalDateTime.of(2026, 9, 10, 10, 0), null);
        StatusTimestampPreviewDto expected = new StatusTimestampPreviewDto(null, null);
        when(historyService.previewTimestamp("history-1", request)).thenReturn(expected);

        assertSame(expected, controller.previewTimestamp("history-1", true, request).getBody());
        verify(historyService).previewTimestamp("history-1", request);
    }
}
