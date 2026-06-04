package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailNotificationDispatchTransactionServiceTest {

    private NotificationRecipientRepository notificationRecipientRepository;
    private EmailNotificationDispatchTransactionService transactionService;

    @BeforeEach
    void setUp() {
        notificationRecipientRepository = mock(NotificationRecipientRepository.class);
        transactionService = new EmailNotificationDispatchTransactionService(notificationRecipientRepository);
    }

    @Test
    void claimBatchMarksClaimedIdsAsProcessing() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 4, 10, 15);
        LocalDateTime staleBefore = now.minusMinutes(15);
        List<Long> ids = List.of(10L, 11L);
        when(notificationRecipientRepository.findClaimableIds(now, staleBefore, 3, 25)).thenReturn(ids);
        when(notificationRecipientRepository.markProcessing(ids, "dispatcher-1", now)).thenReturn(ids.size());

        List<Long> claimedIds = transactionService.claimBatch(25, now, staleBefore, 3, "dispatcher-1");

        assertThat(claimedIds).isEqualTo(ids);
        verify(notificationRecipientRepository).findClaimableIds(now, staleBefore, 3, 25);
        verify(notificationRecipientRepository).markProcessing(ids, "dispatcher-1", now);
    }

    @Test
    void claimBatchSkipsRepositoryCallsWhenLimitIsNotPositive() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 4, 10, 15);
        LocalDateTime staleBefore = now.minusMinutes(15);

        List<Long> claimedIds = transactionService.claimBatch(0, now, staleBefore, 3, "dispatcher-1");

        assertThat(claimedIds).isEmpty();
        verify(notificationRecipientRepository, never()).findClaimableIds(now, staleBefore, 3, 0);
    }

    @Test
    void claimBatchDoesNotUpdateWhenNoIdsAreClaimable() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 4, 10, 15);
        LocalDateTime staleBefore = now.minusMinutes(15);
        when(notificationRecipientRepository.findClaimableIds(now, staleBefore, 3, 25)).thenReturn(List.of());

        List<Long> claimedIds = transactionService.claimBatch(25, now, staleBefore, 3, "dispatcher-1");

        assertThat(claimedIds).isEmpty();
        verify(notificationRecipientRepository, never()).markProcessing(List.of(), "dispatcher-1", now);
    }

    @Test
    void recoverStuckProcessingUsesProcessingTimeoutError() {
        LocalDateTime staleBefore = LocalDateTime.of(2026, 6, 4, 10, 0);
        LocalDateTime retryAt = LocalDateTime.of(2026, 6, 4, 10, 5);
        when(notificationRecipientRepository.markProcessingAsFailed(staleBefore, retryAt, "Processing timeout"))
                .thenReturn(2);

        int updated = transactionService.recoverStuckProcessing(staleBefore, retryAt);

        assertThat(updated).isEqualTo(2);
        verify(notificationRecipientRepository).markProcessingAsFailed(staleBefore, retryAt, "Processing timeout");
    }

    @Test
    void expireRetriesDelegatesToRepository() {
        when(notificationRecipientRepository.markRetriesExhausted(3)).thenReturn(4);

        int updated = transactionService.expireRetries(3);

        assertThat(updated).isEqualTo(4);
        verify(notificationRecipientRepository).markRetriesExhausted(3);
    }
}
