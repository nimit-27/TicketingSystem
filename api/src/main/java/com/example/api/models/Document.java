package com.example.api.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "documents")
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String description;
    private String type;
    @Column(name = "attachment_path")
    private String attachmentPath;
    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}
