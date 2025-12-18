package com.ticketingSystem.api.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.service.OciUploadService;
import com.ticketingSystem.api.service.feignClients.OciFeignClient;
import com.ticketingSystem.api.util.OciRequestSigner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Map;


@Slf4j
@Service
public class OciUploadServiceImpl implements OciUploadService {

    private final OciFeignClient ociFeignClient;
    private final ObjectMapper objectMapper;
    
    @Value("${oci.namespace}")
    private String namespace;
    @Value("${oci.bucket}")
    private String bucket;
    @Value("${oci.region}")
    private String region;
    @Value("${oci.tenancyOcid}")
    private String tenancyOcid;
    @Value("${oci.userOcid}")
    private String userOcid;
    @Value("${oci.fingerprint}")
    private String fingerprint;
//    @Value("${oci.privateKeyPath}")
//    private String privateKeyPath;

    public OciUploadServiceImpl(OciFeignClient ociFeignClient, ObjectMapper objectMapper) {
        this.ociFeignClient = ociFeignClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public void uploadFile(String objectName, byte[] fileBytes) throws Exception {
        String host = "objectstorage." + region + ".oraclecloud.com";
        String path = "/n/" + namespace + "/b/" + bucket + "/o/" + objectName;

        PrivateKey privateKey = loadPrivateKey();
        Map<String, String> headers = OciRequestSigner.generateHeaders(
                "PUT", host, path, fileBytes,
                tenancyOcid, userOcid, fingerprint, privateKey
        );

        ociFeignClient.uploadObject(headers, namespace, bucket, objectName, fileBytes);
    }

    @Override
    public String createPreauthenticatedRequest(String objectName, String accessType, String name, String timeExpires) throws Exception {
        try {
            log.info("Starting pre-authenticated request creation for object: {}", objectName);
            
            // Check if we need to use a different endpoint or authentication method
            log.info("Checking if this is the correct API endpoint for pre-authenticated requests");
            
            String host = "objectstorage." + region + ".oraclecloud.com";
            String path = "/n/" + namespace + "/b/" + bucket + "/p";
            
            log.info("OCI Configuration - Host: {}, Namespace: {}, Bucket: {}, Region: {}", host, namespace, bucket, region);
            log.info("OCI Credentials - Tenancy: {}, User: {}, Fingerprint: {}", tenancyOcid, userOcid, fingerprint);

            // Create the request payload - using the correct OCI format
            String requestBody = String.format(
                "{\"name\":\"%s\",\"bucketListingAction\":\"Deny\",\"objectName\":\"%s\",\"accessType\":\"%s\",\"timeExpires\":\"%s\"}",
                name, objectName, accessType, timeExpires != null ? timeExpires : getDefaultExpirationTime()
            );
            
            log.info("Request Body: {}", requestBody);

            PrivateKey privateKey = loadPrivateKey();
            log.info("Private key loaded successfully, algorithm: {}", privateKey.getAlgorithm());
            
            Map<String, String> headers = OciRequestSigner.generateHeaders(
                    "POST", host, path, requestBody.getBytes(StandardCharsets.UTF_8),
                    tenancyOcid, userOcid, fingerprint, privateKey, "application/json"
            );

            // Add additional headers specific to OCI Object Storage
            headers.put("opc-client-info", "Java-SDK");
            headers.put("user-agent", "Java-SDK");

            log.info("Generated Headers:");
            headers.forEach((key, value) -> {
                if ("authorization".equals(key)) {
                    log.info("  {}: [REDACTED - Authorization header]", key);
                } else {
                    log.info("  {}: {}", key, value);
                }
            });

            log.info("Making request to: https://{}{}", host, path);
            
            // Generate curl command for debugging
            String curlCommand = generateCurlCommand(host, path, headers, requestBody);
            log.info("Curl command for testing:");
            log.info("{}", curlCommand);
            
            String response = ociFeignClient.createPreauthenticatedRequest(headers, namespace, bucket, requestBody);
            log.info("Pre-authenticated request created successfully. Response: {}", response);
            
            // Parse the JSON response to extract the accessUri
            String accessUri = parseAccessUriFromResponse(response);
//            log.info("Extracted access URI: {}", accessUri);

            return accessUri;
            
        } catch (Exception e) {
            log.error("Failed to create pre-authenticated request", e);
            log.error("Error details - Object: {}, AccessType: {}, Name: {}, TimeExpires: {}", 
                     objectName, accessType, name, timeExpires);
            log.error("OCI Configuration - Namespace: {}, Bucket: {}, Region: {}", namespace, bucket, region);
            
            // Log the full error details
            log.error("Full error stack trace:", e);
            
            // Check if this is an authentication issue
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                log.error("This appears to be an authentication issue. Possible causes:");
                log.error("1. The pre-authenticated request API might require different authentication");
                log.error("2. The API endpoint might be incorrect");
                log.error("3. The request format might be wrong");
                log.error("4. The OCI credentials might not have the right permissions");
            }
            
            throw e;
        }
    }

    private String parseAccessUriFromResponse(String response) throws Exception {
        try {
            log.info("Parsing JSON response to extract accessUri");

            // Parse the JSON response
            net.minidev.json.JSONObject jsonResponse = net.minidev.json.JSONValue.parse(response, net.minidev.json.JSONObject.class);

            if (jsonResponse == null) {
                throw new Exception("Failed to parse JSON response");
            }

            // Extract the accessUri
            String accessUri = jsonResponse.get("accessUri").toString();
            if (accessUri == null || accessUri.isEmpty()) {
                throw new Exception("accessUri not found in response");
            }

            // The accessUri already contains the full path, just need to add the base URL
            // accessUri format: /p/6y5G1BWV-XUg-fwSqJ0jWinZdw9xjnrFB8aqRD6-Q6dBBPaxhxs28lXN1b1h244Q/n/bmozxse0db74/b/dev_bucket/o/202509/HeadQuaters/DocumentType/MISCELLANEOUS/AD_DepotMasters.txt
            String fullUrl = "https://objectstorage." + region + ".oraclecloud.com" + accessUri;
            log.info("Constructed full URL: {}", fullUrl);

            return fullUrl;

        } catch (Exception e) {
            log.error("Failed to parse accessUri from response: {}", response, e);
            throw new Exception("Failed to parse accessUri from response: " + e.getMessage(), e);
        }
    }

    private String getDefaultExpirationTime() {
        // Set expiration to 24 hours from now in ISO format
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.add(java.util.Calendar.HOUR, 24);
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
        return sdf.format(cal.getTime());
    }

    private PrivateKey loadPrivateKey() throws Exception {
        try {
            log.info("Loading private key from classpath: oci_api_key.pem");
            ClassPathResource resource = new ClassPathResource("oci_api_key.pem");
            
            if (!resource.exists()) {
                log.error("Private key file not found in classpath: oci_api_key.pem");
                throw new Exception("Private key file not found in classpath: oci_api_key.pem");
            }
            
            String pemContent = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            log.info("Private key file loaded, size: {} bytes", pemContent.length());
            
            // Extract the base64 encoded key content
            String keyContent = extractKeyContent(pemContent);
            log.info("Extracted key content length: {} characters", keyContent.length());
            
            // Decode and create private key
            byte[] decoded = Base64.getDecoder().decode(keyContent);
            log.info("Base64 decoded key size: {} bytes", decoded.length);
            
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
            PrivateKey privateKey = KeyFactory.getInstance("RSA").generatePrivate(spec);
            log.info("Private key created successfully, format: {}", privateKey.getFormat());
            
            return privateKey;
            
        } catch (IOException e) {
            log.error("Failed to read private key file", e);
            throw new Exception("Failed to read private key file: " + e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid private key format", e);
            throw new Exception("Invalid private key format: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error loading private key", e);
            throw e;
        }
    }
    
    private String extractKeyContent(String pemContent) throws Exception {
        String[] lines = pemContent.split("\n");
        StringBuilder keyBuilder = new StringBuilder();
        boolean inKey = false;
        
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("-----BEGIN") && trimmed.contains("PRIVATE KEY")) {
                inKey = true;
                continue;
            }
            if (trimmed.startsWith("-----END") && trimmed.contains("PRIVATE KEY")) {
                inKey = false;
                break;
            }
            if (inKey && !trimmed.isEmpty()) {
                keyBuilder.append(trimmed);
            }
        }
        
        String keyContent = keyBuilder.toString();
        if (keyContent.isEmpty()) {
            throw new Exception("No private key content found in PEM file");
        }
        
        return keyContent;
    }
    
    private String generateCurlCommand(String host, String path, Map<String, String> headers, String requestBody) {
        StringBuilder curl = new StringBuilder();
        curl.append("curl -X POST ");
        curl.append("\"https://").append(host).append(path).append("\" ");
        
        // Add headers
        headers.forEach((key, value) -> {
            if (!"authorization".equals(key.toLowerCase())) {
                // Use double quotes for header values
                String escapedValue = value.replace("\"", "\\\"");
                curl.append("-H \"").append(key).append(": ").append(escapedValue).append("\" ");
            }
        });
        
        // Add authorization header separately (it's long and needs special handling)
        String authHeader = headers.get("authorization");
        if (authHeader != null) {
            // Escape the authorization header properly
            String escapedAuth = authHeader.replace("\"", "\\\"");
            curl.append("-H \"Authorization: ").append(escapedAuth).append("\" ");
        }
        
        // Add request body
        if (requestBody != null && !requestBody.isEmpty()) {
            String escapedBody = requestBody.replace("\"", "\\\"");
            curl.append("-d \"").append(escapedBody).append("\" ");
        }
        
        curl.append("-v"); // Verbose output for debugging
        
        return curl.toString();
    }
}

