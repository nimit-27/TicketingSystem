package com.ticketingSystem.api.service;

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
public class RootCauseAnalysisStorageService {

    @Value("${file.storage.base-dir}")
    private String baseDir;

    public String save(MultipartFile file, String ticketId) throws IOException {
        Path basePath = Paths.get(baseDir).toAbsolutePath().normalize();
        Path dirPath = basePath.resolve(Paths.get("rca", ticketId)).normalize();
        Files.createDirectories(dirPath);
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" + original;
        Path filePath = dirPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return Paths.get("rca", ticketId, filename).toString().replace('\\', '/');
    }

    public void delete(String relativePath) throws IOException {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        Path basePath = Paths.get(baseDir).toAbsolutePath().normalize();
        Path filePath = basePath.resolve(relativePath).normalize();
        if (!filePath.startsWith(basePath)) {
            throw new IOException("Invalid file path");
        }
        Files.deleteIfExists(filePath);
    }
}
