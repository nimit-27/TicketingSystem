package com.ticketingSystem.fileManagement.controller;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.fileManagement.dto.FileUploadRequest;
import com.ticketingSystem.fileManagement.dto.ManagedFileResponse;
import com.ticketingSystem.fileManagement.service.FileManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequestMapping("/file-management")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowCredentials = "true")
public class FileManagementController {

    private final FileManagementService fileManagementService;
    private final JwtProperties jwtProperties;

    @PostMapping("/files")
    @PreAuthorize("@jwtProperties.isBypassEnabled() or hasRole('HELPDESK') or hasRole('ADMIN')")
    public ResponseEntity<ManagedFileResponse> uploadFile(@RequestPart("file") MultipartFile file,
                                                          @RequestPart(value = "metadata", required = false) FileUploadRequest metadata,
                                                          @AuthenticationPrincipal LoginPayload user) throws IOException {
        FileUploadRequest payload = metadata != null ? metadata : new FileUploadRequest();
        ManagedFileResponse response = fileManagementService.upload(file, payload, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/files")
    @PreAuthorize("@jwtProperties.isBypassEnabled() or isAuthenticated()")
    public ResponseEntity<List<ManagedFileResponse>> listFiles(@RequestParam(value = "section", required = false) String section,
                                                               @AuthenticationPrincipal LoginPayload user) {
        List<ManagedFileResponse> files = fileManagementService.listAccessible(user, section);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/files/{id}")
    @PreAuthorize("@jwtProperties.isBypassEnabled() or isAuthenticated()")
    public ResponseEntity<ManagedFileResponse> getMetadata(@PathVariable("id") String id,
                                                           @AuthenticationPrincipal LoginPayload user) {
        ManagedFileResponse response = fileManagementService.getFileMetadata(id, user);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/files/{id}/content")
    @PreAuthorize("@jwtProperties.isBypassEnabled() or isAuthenticated()")
    public ResponseEntity<Resource> download(@PathVariable("id") String id,
                                             @AuthenticationPrincipal LoginPayload user) throws MalformedURLException {
        Resource resource = fileManagementService.loadFile(id, user);
        if (resource == null) {
            return ResponseEntity.notFound().build();
        }
        String filename = resource.getFilename();
        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (filename != null ? filename : "file") + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
