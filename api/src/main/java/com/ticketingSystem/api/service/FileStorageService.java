package com.ticketingSystem.api.service;

import com.ticketingSystem.api.common.OciPathEncoder;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.UploadedFile;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.UploadedFileRepository;
import com.ticketingSystem.api.config.OciProperties;
import com.ticketingSystem.api.service.feignClients.OciFeignClient;
import com.ticketingSystem.api.util.OciRequestSigner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Map;

@Service
public class FileStorageService {

    private final UploadedFileRepository uploadedFileRepository;
    private final TicketRepository ticketRepository;
    private final OciObjectStorageService ociObjectStorageService;
    private final OciProperties ociProperties;
    private final OciFeignClient ociFeignClient;

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

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

    public FileStorageService(UploadedFileRepository uploadedFileRepository,
                              TicketRepository ticketRepository,
                              OciObjectStorageService ociObjectStorageService,
                              OciProperties ociProperties, OciFeignClient ociFeignClient) {
        this.uploadedFileRepository = uploadedFileRepository;
        this.ticketRepository = ticketRepository;
        this.ociObjectStorageService = ociObjectStorageService;
        this.ociProperties = ociProperties;
        this.ociFeignClient = ociFeignClient;
    }

    public String save(MultipartFile file, String ticketId, String uploadedBy) throws IOException {
        String original = StringUtils.cleanPath(file.getOriginalFilename());

        UploadedFile uf = new UploadedFile();
        uf.setFileName(original);
        int dot = original.lastIndexOf('.');
        if (dot >= 0 && dot < original.length() - 1) {
            uf.setFileExtension(original.substring(dot + 1));
        }
        uf.setUploadedBy(uploadedBy);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        uf.setTicket(ticket);

        // Persist first to obtain the generated id for building a stable filename.
        UploadedFile savedFile = uploadedFileRepository.save(uf);

        String filename = savedFile.getId() + "_" + original;
        String relativePath = buildObjectKey(ticketId, filename);
        savedFile.setRelativePath(relativePath);
        uploadedFileRepository.save(savedFile);

        ociObjectStorageService.upload(file, relativePath);

        return relativePath;
    }

    public byte[] download(String relativePath) {
        String updatedRelativePath = "ticket/" + relativePath;
        String host = "objectstorage." + region + ".oraclecloud.com";
        String encodedUpdatedRelativePath = OciPathEncoder.encodeObjectKey(updatedRelativePath);
        String path = "/n/" + namespace + "/b/" + bucket + "/o/" + encodedUpdatedRelativePath;

        try {
            PrivateKey privateKey = loadPrivateKey();
            Map<String, String> headers = OciRequestSigner.generateHeaders(
                    "GET", host, path, new byte[0],
                    tenancyOcid, userOcid, fingerprint, privateKey, MediaType.APPLICATION_OCTET_STREAM_VALUE
            );

            ResponseEntity<byte[]> response = ociFeignClient.downloadObject(headers, namespace, bucket, encodedUpdatedRelativePath);
            return response.getBody();
        } catch (Exception ex) {
            log.error("Failed to download object {} from OCI", encodedUpdatedRelativePath, ex);
            throw new RuntimeException("Failed to download attachment from OCI", ex);
        }
    }

    public void uploadFile(String objectName, byte[] fileBytes) throws Exception {
        String updatedObjectName = "ticket/" + objectName;
        String host = "objectstorage." + region + ".oraclecloud.com";
        String path = "/n/" + namespace + "/b/" + bucket + "/o/" + updatedObjectName;

        PrivateKey privateKey = loadPrivateKey();
        Map<String, String> headers = OciRequestSigner.generateHeaders(
                "PUT", host, path, fileBytes,
                tenancyOcid, userOcid, fingerprint, privateKey
        );

        ResponseEntity<String> res = ociFeignClient.uploadObject(headers, namespace, bucket, updatedObjectName, fileBytes);
        System.out.println(res);
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


    private String buildObjectKey(String ticketId, String filename) {
        String prefix = ociProperties.getNormalizedBucketObject();
        if (prefix.isBlank()) {
            return ticketId + "/" + filename;
        }
        return prefix + "/" + ticketId + "/" + filename;
    }
}
