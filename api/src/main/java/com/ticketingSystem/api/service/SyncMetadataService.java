package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.SyncMetadata;
import com.ticketingSystem.api.repository.SyncMetadataRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SyncMetadataService {
    private final SyncMetadataRepository syncMetadataRepository;

    private static final String LAST_SYNC_KEY = "last_sync_time";


    public SyncMetadataService(SyncMetadataRepository syncMetadataRepository) {
        this.syncMetadataRepository = syncMetadataRepository;
    }

    public LocalDateTime getLastSyncedTime() {
        return syncMetadataRepository.findById(LAST_SYNC_KEY)
                .map(meta -> LocalDateTime.parse(meta.getValue()))
                .orElse(null);
    }

    public void updateLastSyncedTime(LocalDateTime time) {
        SyncMetadata meta = new SyncMetadata();
        meta.setKey(LAST_SYNC_KEY);
        meta.setValue(time.toString()); // ISO format
        syncMetadataRepository.save(meta);
    }
}
