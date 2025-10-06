package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByIsDeletedFalse();
}
