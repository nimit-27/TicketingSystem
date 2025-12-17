package com.ticketingSystem.api.dto;

import org.springframework.http.MediaType;

public record AttachmentDownloadDto(String fileName, MediaType mediaType, byte[] content) {
}

