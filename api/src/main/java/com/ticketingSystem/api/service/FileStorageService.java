package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.UploadedFile;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.UploadedFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.storage.base-dir}")
    private String baseDir;

    private final UploadedFileRepository uploadedFileRepository;
    private final TicketRepository ticketRepository;

    public FileStorageService(UploadedFileRepository uploadedFileRepository,
                              TicketRepository ticketRepository) {
        this.uploadedFileRepository = uploadedFileRepository;
        this.ticketRepository = ticketRepository;
    }

    public String save(MultipartFile file, String ticketId, String uploadedBy) throws IOException {
        Path dirPath = Paths.get(baseDir, ticketId);
        Files.createDirectories(dirPath);
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" + original;
        Path filePath = dirPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        String relativePath = ticketId + "/" + filename;

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
}
