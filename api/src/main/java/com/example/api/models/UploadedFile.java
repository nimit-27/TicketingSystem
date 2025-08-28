package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "uploaded_files")
@Data
public class UploadedFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uploaded_file_id")
    private String id;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_extension")
    private String fileExtension;

    @Column(name = "relative_path")
    private String relativePath;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", referencedColumnName = "ticket_id")
    private Ticket ticket;

    @Column(name = "uploaded_on", insertable = false, updatable = false)
    private LocalDateTime uploadedOn;

    @Column(name = "is_active")
    private String isActive = "Y";
}
