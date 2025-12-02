package com.ticketingSystem.fileManagement.repository;

import com.ticketingSystem.fileManagement.models.ManagedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagedFileRepository extends JpaRepository<ManagedFile, String> {
    List<ManagedFile> findByActiveTrue();
}
