package com.ticketingSystem.api.service;

import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import com.ticketingSystem.api.config.OciProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class OciObjectStorageService {

//    private final ObjectStorage client;
//    private final OciProperties props;
    private static final Logger logger = LoggerFactory.getLogger(OciObjectStorageService.class);

//    public OciObjectStorageService(OciProperties props) throws IOException {
//        this.props = props;
//
//        ConfigFileAuthenticationDetailsProvider provider =
//                new ConfigFileAuthenticationDetailsProvider("~/ap-mumbai-1", "DEFAULT");
//
//        this.client = ObjectStorageClient.builder().build(provider);
//
////        // Prefer endpoint; else set region
////        if (props.getEndpoint() != null && !props.getEndpoint().isBlank()) {
////            this.client.setEndpoint(props.getEndpoint());
////        } else if (props.getRegion() != null && !props.getRegion().isBlank()) {
////            this.client.setRegion(com.oracle.bmc.Region.fromRegionId(props.getRegion()));
////        }
//    }

//    public void upload(MultipartFile file, String objectKey) throws IOException {
//        PutObjectRequest request = PutObjectRequest.builder()
//                .bucketName(props.getBucket())
//                .namespaceName(props.getNamespace())
//                .objectName(objectKey)
//                .contentLength(file.getSize())
//                .putObjectBody(file.getInputStream())
//                .contentType(Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"))
//                .build();
//
//        client.putObject(request);
//    }

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
