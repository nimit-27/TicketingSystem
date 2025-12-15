package com.ticketingSystem.api.util;

import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.Signature;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class OciRequestSigner {

    public static Map<String, String> generateHeaders(
            String method, String host, String path, byte[] content,
            String tenancyOcid, String userOcid, String fingerprint, PrivateKey privateKey) throws Exception {
        
        return generateHeaders(method, host, path, content, tenancyOcid, userOcid, fingerprint, privateKey, "application/octet-stream");
    }

    public static Map<String, String> generateHeaders(
            String method, String host, String path, byte[] content,
            String tenancyOcid, String userOcid, String fingerprint, PrivateKey privateKey, String contentType) throws Exception {

        log.info("Generating OCI headers for {} {} with content type: {}", method, path, contentType);
        
        String date = DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.now(ZoneOffset.UTC));
        String sha256 = Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA-256").digest(content));
        
        log.info("Generated date: {}", date);
        log.info("Content SHA256: {}", sha256);

        // Build the signing string according to OCI documentation
        // The order and format are critical for OCI signature validation
        StringBuilder signingString = new StringBuilder();
        signingString.append("date: ").append(date).append("\n");
        signingString.append("(request-target): ").append(method.toLowerCase()).append(" ").append(path).append("\n");
        signingString.append("host: ").append(host).append("\n");
        signingString.append("x-content-sha256: ").append(sha256).append("\n");
        signingString.append("content-type: ").append(contentType);
        
        log.info("Signing string:\n{}", signingString.toString());

        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initSign(privateKey);
        sig.update(signingString.toString().getBytes(StandardCharsets.UTF_8));
        String signature = Base64.getEncoder().encodeToString(sig.sign());
        
        log.info("Generated signature: {}", signature);

        // Build authorization header with correct header order
        String auth = String.format(
                "Signature version=\"1\",keyId=\"%s/%s/%s\",algorithm=\"rsa-sha256\",headers=\"date (request-target) host x-content-sha256 content-type\",signature=\"%s\"",
                tenancyOcid, userOcid, fingerprint, signature);
        
        log.info("Authorization header: [REDACTED - contains signature]");

        Map<String, String> headers = new HashMap<>();
        headers.put("date", date);
        headers.put("host", host);
        headers.put("x-content-sha256", sha256);
        headers.put("content-type", contentType);
        headers.put("authorization", auth);
        
        // Add additional headers that OCI might expect
        headers.put("opc-client-info", "Java-SDK");
        headers.put("user-agent", "Java-SDK");
        
        log.info("Generated {} headers successfully", headers.size());
        return headers;
    }
}

