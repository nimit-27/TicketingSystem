package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.Document;
import com.ticketingSystem.api.service.DocumentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

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
        return ResponseEntity.ok(documentService.updateDocument(id, doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        documentService.softDeleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
