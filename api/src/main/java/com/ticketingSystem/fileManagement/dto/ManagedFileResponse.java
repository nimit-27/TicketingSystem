package com.ticketingSystem.fileManagement.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ManagedFileResponse {
    private String id;
    private String fileName;
    private String section;
    private String description;
    private String uploadedBy;
    private String uploadedByName;
    private LocalDateTime uploadedOn;
    private long fileSize;
    private String contentType;
    private List<String> roles;
    private List<String> userIds;
    private String storagePath;
}
