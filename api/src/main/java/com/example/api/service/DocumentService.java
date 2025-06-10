package com.example.api.service;

import com.example.api.models.Document;
import com.example.api.repository.DocumentRepository;
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

    public Document updateDocument(Integer id, Document doc) {
        Document existing = documentRepository.findById(id).orElseThrow();
        existing.setTitle(doc.getTitle());
        existing.setDescription(doc.getDescription());
        existing.setType(doc.getType());
        existing.setAttachmentPath(doc.getAttachmentPath());
        return documentRepository.save(existing);
    }

    public void softDeleteDocument(Integer id) {
        Document existing = documentRepository.findById(id).orElseThrow();
//        existing.setIsDeleted(true);
        documentRepository.save(existing);
    }
}
