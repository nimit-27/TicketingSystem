package com.ticketingSystem.reportGenerator.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_artifact")
@Getter
@Setter
public class ReportArtifact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "artifact_id")
    private Long artifactId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private ReportRequestHistory request;

    @Column(name = "file_name", nullable = false, length = 512)
    private String fileName;

    @Column(name = "content_type", length = 255)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "storage_location", nullable = false, columnDefinition = "TEXT")
    private String storageLocation;

    @Column(name = "checksum", length = 255)
    private String checksum;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "download_count", nullable = false)
    private Integer downloadCount = 0;

    @Column(name = "last_downloaded_at")
    private LocalDateTime lastDownloadedAt;
}
