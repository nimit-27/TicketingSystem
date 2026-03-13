package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.OciProperties;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.UploadedFile;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.UploadedFileRepository;
import com.ticketingSystem.api.service.feignClients.OciFeignClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @Mock
    private UploadedFileRepository uploadedFileRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private OciObjectStorageService ociObjectStorageService;
    @Mock
    private OciFeignClient ociFeignClient;

    @Spy
    @InjectMocks
    private FileStorageService service;

    private OciProperties ociProperties;

    @BeforeEach
    void setUp() {
        ociProperties = new OciProperties();
        ReflectionTestUtils.setField(ociProperties, "bucketObject", "/attachments/");
        ReflectionTestUtils.setField(service, "ociProperties", ociProperties);
    }

    @Test
    void saveShouldPersistMetadataUploadBytesAndReturnRelativePath() throws Exception {
        Ticket ticket = new Ticket();
        when(ticketRepository.findById("T1")).thenReturn(Optional.of(ticket));
        when(uploadedFileRepository.save(any(UploadedFile.class))).thenAnswer(invocation -> {
            UploadedFile uf = invocation.getArgument(0);
            if (uf.getId() == null) {
                uf.setId("file-123");
            }
            return uf;
        });
        doReturn("ticket/attachments/T1/file-123_test.pdf").when(service)
                .uploadFile(eq("attachments/T1/file-123_test.pdf"), any(byte[].class));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "hello".getBytes(StandardCharsets.UTF_8)
        );

        String path = service.save(file, "T1", "user-a");

        assertThat(path).isEqualTo("attachments/T1/file-123_test.pdf");

        ArgumentCaptor<UploadedFile> captor = ArgumentCaptor.forClass(UploadedFile.class);
        verify(uploadedFileRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues().get(1).getRelativePath()).isEqualTo("attachments/T1/file-123_test.pdf");
    }

    @Test
    void saveShouldDeleteMetadataWhenUploadFails() throws Exception {
        Ticket ticket = new Ticket();
        when(ticketRepository.findById("T1")).thenReturn(Optional.of(ticket));
        UploadedFile saved = new UploadedFile();
        saved.setId("file-1");
        when(uploadedFileRepository.save(any(UploadedFile.class))).thenReturn(saved);
        doThrow(new RuntimeException("oci fail")).when(service)
                .uploadFile(eq("attachments/T1/file-1_image.png"), any(byte[].class));

        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", new byte[]{1, 2});

        assertThatThrownBy(() -> service.save(file, "T1", "u1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("oci fail");

        verify(uploadedFileRepository).delete(saved);
    }

    @Test
    void saveShouldThrowWhenTicketIsMissing() {
        when(ticketRepository.findById("missing")).thenReturn(Optional.empty());
        MockMultipartFile file = new MockMultipartFile("file", "a.txt", "text/plain", new byte[]{1});

        assertThatThrownBy(() -> service.save(file, "missing", "u"))
                .isInstanceOf(TicketNotFoundException.class);
    }

    @Test
    void privateObjectKeyHelpersShouldNormalizeValuesForEdgeInputs() throws Exception {
        Method normalizeObjectKey = FileStorageService.class.getDeclaredMethod("normalizeObjectKey", String.class);
        Method ensureTicketPrefix = FileStorageService.class.getDeclaredMethod("ensureTicketPrefix", String.class);
        Method buildObjectName = FileStorageService.class.getDeclaredMethod("buildObjectName", String.class, String.class);
        normalizeObjectKey.setAccessible(true);
        ensureTicketPrefix.setAccessible(true);
        buildObjectName.setAccessible(true);

        String normalized = (String) normalizeObjectKey.invoke(service, "https://host/n/ns/b/bucket/o/path/file.png");
        assertThat(normalized).isEqualTo("path/file.png");

        String prefixed = (String) ensureTicketPrefix.invoke(service, "path/file.png");
        assertThat(prefixed).isEqualTo("ticket/path/file.png");

        String objectName = (String) buildObjectName.invoke(service, "\\nested//path/", "ignored");
        assertThat(objectName).isEqualTo("ticket/nested/path");
    }
}
