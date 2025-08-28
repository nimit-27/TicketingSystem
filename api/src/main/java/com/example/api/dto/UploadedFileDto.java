package com.example.api.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class UploadedFileDto {
    private String id;
    private String fileName;
    private String fileExtension;
    private String relativePath;
    private String uploadedBy;
    private String ticketId;
    private LocalDateTime uploadedOn;
    private String isActive;
}
