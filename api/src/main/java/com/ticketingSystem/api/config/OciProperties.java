package com.ticketingSystem.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "oci")
public class OciProperties {

    private String namespace;
    private String bucket;
    private String bucketObject;
    private String region;
    private String endpoint;
    private String configFile;
    private String profile = "DEFAULT";

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getBucketObject() {
        return bucketObject;
    }

    public void setBucketObject(String bucketObject) {
        this.bucketObject = bucketObject;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getConfigFile() {
        return configFile;
    }

    public void setConfigFile(String configFile) {
        this.configFile = configFile;
    }

    public String getProfile() {
        return profile;
    }

    public void setProfile(String profile) {
        if (profile != null && !profile.isBlank()) {
            this.profile = profile;
        }
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
