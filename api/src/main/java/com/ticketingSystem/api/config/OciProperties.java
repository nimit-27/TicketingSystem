package com.ticketingSystem.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

//@Setter
//@Getter
//@Component
@ConfigurationProperties(prefix = "oci")
public class OciProperties {

    // Required for Object Storage API calls
    private String namespace;   // e.g., bmozxse0db74
    private String bucket;      // e.g., dev_bucket
    private String region;      // e.g., ap-mumbai-1 (optional if endpoint set)
    private String endpoint;    // e.g., https://objectstorage.ap-mumbai-1.oraclecloud.com (optional if region used)

    private String bucketObject;

    public String getNormalizedBucketObject() {
        if (bucketObject == null) {
            return "";
        }
        String trimmed = bucketObject.trim();
        while (trimmed.startsWith("/")) {
            trimmed = trimmed.substring(1);
        }
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
