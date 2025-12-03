package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.UploadedFile;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.UploadedFileRepository;
import com.ticketingSystem.api.config.OciProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final UploadedFileRepository uploadedFileRepository;
    private final TicketRepository ticketRepository;
    private final OciObjectStorageService ociObjectStorageService;
    private final OciProperties ociProperties;

    public FileStorageService(UploadedFileRepository uploadedFileRepository,
                              TicketRepository ticketRepository,
                              OciObjectStorageService ociObjectStorageService,
                              OciProperties ociProperties) {
        this.uploadedFileRepository = uploadedFileRepository;
        this.ticketRepository = ticketRepository;
        this.ociObjectStorageService = ociObjectStorageService;
        this.ociProperties = ociProperties;
    }

    public String save(MultipartFile file, String ticketId, String uploadedBy) throws IOException {
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" + original;
        String relativePath = buildObjectKey(ticketId, filename);
        ociObjectStorageService.upload(file, relativePath);

        UploadedFile uf = new UploadedFile();
        uf.setFileName(original);
        int dot = original.lastIndexOf('.');
        if (dot >= 0 && dot < original.length() - 1) {
            uf.setFileExtension(original.substring(dot + 1));
        }
        uf.setRelativePath(relativePath);
        uf.setUploadedBy(uploadedBy);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        uf.setTicket(ticket);
        uploadedFileRepository.save(uf);

        return relativePath;
    }

    private String buildObjectKey(String ticketId, String filename) {
        String prefix = ociProperties.getNormalizedBucketObject();
        if (prefix.isBlank()) {
            return ticketId + "/" + filename;
        }
        return prefix + "/" + ticketId + "/" + filename;
    }
}
