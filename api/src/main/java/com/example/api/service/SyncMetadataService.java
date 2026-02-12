package com.example.api.service;

import com.example.api.models.SyncMetadata;
import com.example.api.repository.SyncMetadataRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
public class SyncMetadataService {
    private final SyncMetadataRepository syncMetadataRepository;

    private static final String LAST_SYNC_KEY = "last_sync_time";
    private static final ZoneId INDIA_ZONE = ZoneId.of("Asia/Kolkata");

    public SyncMetadataService(SyncMetadataRepository syncMetadataRepository) {
        this.syncMetadataRepository = syncMetadataRepository;
    }

    public LocalDateTime getLastSyncedTime() {
        return syncMetadataRepository.findById(LAST_SYNC_KEY)
                .map(meta -> parseToIndiaLocalDateTime(meta.getValue()))
                .orElse(null);
    }

    public void updateLastSyncedTime(LocalDateTime time) {
        SyncMetadata meta = new SyncMetadata();
        meta.setKey(LAST_SYNC_KEY);
        meta.setValue(time.atZone(INDIA_ZONE).toOffsetDateTime().toString());
        syncMetadataRepository.save(meta);
    }

    private LocalDateTime parseToIndiaLocalDateTime(String value) {
        try {
            return OffsetDateTime.parse(value).atZoneSameInstant(INDIA_ZONE).toLocalDateTime();
        } catch (Exception ignored) {
            return LocalDateTime.parse(value);
        }
    }
}
