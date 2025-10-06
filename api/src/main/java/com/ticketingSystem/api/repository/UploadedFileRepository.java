package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, String> {
    List<UploadedFile> findByTicket_IdAndIsActive(String ticketId, String isActive);
    java.util.Optional<UploadedFile> findByTicket_IdAndRelativePath(String ticketId, String relativePath);
}
