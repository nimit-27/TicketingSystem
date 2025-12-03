package com.ticketingSystem.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "oci")
public class OciProperties {

    private String bucketObject;

    public String getBucketObject() {
        return bucketObject;
    }

    public void setBucketObject(String bucketObject) {
        this.bucketObject = bucketObject;
    }

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
