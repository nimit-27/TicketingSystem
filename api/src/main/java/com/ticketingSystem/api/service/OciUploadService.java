package com.ticketingSystem.api.service;

public interface OciUploadService {
    void uploadFile(String objectName, byte[] fileBytes) throws Exception;
    
    String createPreauthenticatedRequest(String objectName, String accessType, String name, String timeExpires) throws Exception;
}

