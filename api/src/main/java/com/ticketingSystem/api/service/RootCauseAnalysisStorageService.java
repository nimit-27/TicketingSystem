package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.OciProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class RootCauseAnalysisStorageService {

    private final OciObjectStorageService ociObjectStorageService;
    private final OciProperties ociProperties;

    public RootCauseAnalysisStorageService(OciObjectStorageService ociObjectStorageService,
                                           OciProperties ociProperties) {
        this.ociObjectStorageService = ociObjectStorageService;
        this.ociProperties = ociProperties;
    }

    public String save(MultipartFile file, String ticketId) throws IOException {
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" + original;
        String objectKey = buildObjectKey(ticketId, filename);
        ociObjectStorageService.upload(file, objectKey);
        return objectKey;
    }

    public void delete(String relativePath) throws IOException {
        ociObjectStorageService.delete(relativePath);
    }

    private String buildObjectKey(String ticketId, String filename) {
        String prefix = ociProperties.getNormalizedBucketObject();
        if (prefix.isBlank()) {
            return "rca/" + ticketId + "/" + filename;
        }
        return prefix + "/rca/" + ticketId + "/" + filename;
    }
}
