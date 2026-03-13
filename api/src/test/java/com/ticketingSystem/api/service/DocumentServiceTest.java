package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.models.Document;
import com.ticketingSystem.api.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @InjectMocks
    private DocumentService service;

    @Test
    void getDocumentsShouldReturnOnlyNonDeletedDocumentsFromRepository() {
        Document d = new Document();
        d.setId("doc-1");
        when(documentRepository.findByIsDeletedFalse()).thenReturn(List.of(d));

        assertThat(service.getDocuments()).containsExactly(d);
    }

    @Test
    void addDocumentShouldPersistProvidedDocument() {
        Document doc = new Document();
        doc.setTitle("FAQ");
        when(documentRepository.save(doc)).thenReturn(doc);

        assertThat(service.addDocument(doc)).isSameAs(doc);
        verify(documentRepository).save(doc);
    }

    @Test
    void updateDocumentShouldCopyEditableFieldsAndSave() {
        Document existing = new Document();
        existing.setId("doc-1");
        existing.setTitle("Old");

        Document update = new Document();
        update.setTitle("New title");
        update.setDescription("Updated description");
        update.setType("pdf");
        update.setAttachmentPath("ticket/1/new.pdf");

        when(documentRepository.findById("doc-1")).thenReturn(Optional.of(existing));
        when(documentRepository.save(existing)).thenReturn(existing);

        Document result = service.updateDocument("doc-1", update);

        assertThat(result.getTitle()).isEqualTo("New title");
        assertThat(result.getDescription()).isEqualTo("Updated description");
        assertThat(result.getType()).isEqualTo("pdf");
        assertThat(result.getAttachmentPath()).isEqualTo("ticket/1/new.pdf");
    }

    @Test
    void updateDocumentShouldThrowWhenDocumentIsMissing() {
        when(documentRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateDocument("missing", new Document()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void softDeleteDocumentShouldThrowWhenDocumentIsMissing() {
        when(documentRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.softDeleteDocument("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
