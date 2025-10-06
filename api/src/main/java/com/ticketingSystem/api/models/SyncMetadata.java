package com.ticketingSystem.api.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_metadata")
@Data
public class SyncMetadata {
    @Id
    @Column(name = "`key`")
    String key;

    String value;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

}
