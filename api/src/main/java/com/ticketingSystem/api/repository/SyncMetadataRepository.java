package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.SyncMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyncMetadataRepository extends JpaRepository<SyncMetadata, String> {
}
