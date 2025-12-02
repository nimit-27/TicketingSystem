package com.ticketingSystem.fileManagement.repository;

import com.ticketingSystem.fileManagement.models.ManagedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManagedFileRepository extends JpaRepository<ManagedFile, String> {
    List<ManagedFile> findByActiveTrue();
}
