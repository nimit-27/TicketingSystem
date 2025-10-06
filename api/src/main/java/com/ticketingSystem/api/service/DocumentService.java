package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.models.Document;
import com.ticketingSystem.api.repository.DocumentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public List<Document> getDocuments() {
        return documentRepository.findByIsDeletedFalse();
    }

    public Document addDocument(Document doc) {
        return documentRepository.save(doc);
    }

    public Document updateDocument(String id, Document doc) {
        Document existing = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        existing.setTitle(doc.getTitle());
        existing.setDescription(doc.getDescription());
        existing.setType(doc.getType());
        existing.setAttachmentPath(doc.getAttachmentPath());
        return documentRepository.save(existing);
    }

    public void softDeleteDocument(String id) {
        Document existing = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
//        existing.setIsDeleted(true);
        documentRepository.save(existing);
    }
}
