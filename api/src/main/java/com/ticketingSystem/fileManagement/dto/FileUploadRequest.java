package com.ticketingSystem.fileManagement.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FileUploadRequest {
    private String section;
    private String description;
    private List<String> roles;
    private List<String> userIds;
}
