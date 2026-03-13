package com.ticketingSystem.api.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class OciObjectStorageServiceTest {

    private final OciObjectStorageService service = new OciObjectStorageService();

    @Test
    void uploadShouldReturnObjectKeyWithoutAttemptingRealOciUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile("f", "name.txt", "text/plain", "x".getBytes());

        assertThat(service.upload(file, "ticket/path/name.txt")).isEqualTo("ticket/path/name.txt");
    }

    @Test
    void deleteShouldNoOpForNullOrBlankAndNotThrowForNormalKey() {
        assertThatCode(() -> service.delete(null)).doesNotThrowAnyException();
        assertThatCode(() -> service.delete("   ")).doesNotThrowAnyException();
        assertThatCode(() -> service.delete("ticket/path/file.txt")).doesNotThrowAnyException();
    }
}
