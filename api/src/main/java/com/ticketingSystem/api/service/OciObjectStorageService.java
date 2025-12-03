package com.ticketingSystem.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class OciObjectStorageService {

    private static final Logger logger = LoggerFactory.getLogger(OciObjectStorageService.class);

    public String upload(MultipartFile file, String objectKey) throws IOException {
        logger.warn("OCI storage is disabled in this environment. Skipping upload for {}.", objectKey);
        return objectKey;
    }

    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }
        logger.warn("OCI storage is disabled in this environment. Skipping delete for {}.", objectKey);
    }
}
