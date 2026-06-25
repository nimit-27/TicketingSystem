package com.ticketingSystem.api.scheduler;

import com.ticketingSystem.api.service.RequesterUserSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RequesterUserSyncScheduler {
    private final RequesterUserSyncService requesterUserSyncService;

    @Value("${app.requester-user-sync.batch-size:200}")
    private int batchSize;

    @Scheduled(cron = "${app.requester-user-sync.cron:0 */5 * * * *}", zone = "${app.requester-user-sync.zone:Asia/Kolkata}")
    public void processRequesterUserSyncRows() {
        int processed = requesterUserSyncService.processNextBatch(batchSize);
        if (processed > 0) {
            log.info("Processed {} requester user sync staging rows", processed);
        }
    }
}
