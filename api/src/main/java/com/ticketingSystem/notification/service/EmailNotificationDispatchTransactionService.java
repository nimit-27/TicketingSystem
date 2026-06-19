package com.ticketingSystem.notification.service;

import com.ticketingSystem.notification.repository.NotificationRecipientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailNotificationDispatchTransactionService {
    private static final String PROCESSING_TIMEOUT_ERROR = "Processing timeout";

    private final NotificationRecipientRepository notificationRecipientRepository;

    @Transactional
    public List<Long> claimBatch(int limit,
                                 LocalDateTime now,
                                 LocalDateTime staleBefore,
                                 int maxRetries,
                                 String instanceId) {
        if (limit <= 0) {
            return Collections.emptyList();
        }
        List<Long> ids = notificationRecipientRepository.findClaimableIds(
                now,
                staleBefore,
                maxRetries,
                limit
        );
        if (ids.isEmpty()) {
            return ids;
        }
        notificationRecipientRepository.markProcessing(ids, instanceId, now);
        return ids;
    }

    @Transactional
    public int recoverStuckProcessing(LocalDateTime staleBefore, LocalDateTime retryAt) {
        return notificationRecipientRepository.markProcessingAsFailed(
                staleBefore,
                retryAt,
                PROCESSING_TIMEOUT_ERROR
        );
    }

    @Transactional
    public int expireRetries(int maxRetries) {
        return notificationRecipientRepository.markRetriesExhausted(maxRetries);
    }
}
