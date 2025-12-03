package com.ticketingSystem.api.service;

import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.DeleteObjectRequest;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import com.ticketingSystem.api.config.OciProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class OciObjectStorageService {

    private final ObjectStorage objectStorageClient;
    private final OciProperties ociProperties;

    public OciObjectStorageService(ObjectStorage objectStorageClient, OciProperties ociProperties) {
        this.objectStorageClient = objectStorageClient;
        this.ociProperties = ociProperties;
    }

    public String upload(MultipartFile file, String objectKey) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucketName(ociProperties.getBucket())
                    .namespaceName(ociProperties.getNamespace())
                    .objectName(objectKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .putObjectBody(inputStream)
                    .build();
            objectStorageClient.putObject(request);
            return objectKey;
        }
    }

    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucketName(ociProperties.getBucket())
                .namespaceName(ociProperties.getNamespace())
                .objectName(objectKey)
                .build();
        objectStorageClient.deleteObject(request);
    }
}
