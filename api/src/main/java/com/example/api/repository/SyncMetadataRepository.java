package com.example.api.repository;

import com.example.api.models.SyncMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyncMetadataRepository extends JpaRepository<SyncMetadata, String> {
}
