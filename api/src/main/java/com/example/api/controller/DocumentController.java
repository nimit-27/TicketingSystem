package com.example.api.controller;

import com.example.api.models.Document;
import com.example.api.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentController {
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<List<Document>> getDocuments() {
        return ResponseEntity.ok(documentService.getDocuments());
    }

    @PostMapping
    public ResponseEntity<Document> addDocument(@RequestBody Document doc) {
        return ResponseEntity.ok(documentService.addDocument(doc));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable String id, @RequestBody Document doc) {
        return ResponseEntity.ok(documentService.updateDocument(Integer.valueOf(id), doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        documentService.softDeleteDocument(Integer.valueOf(id));
        return ResponseEntity.noContent().build();
    }
}
