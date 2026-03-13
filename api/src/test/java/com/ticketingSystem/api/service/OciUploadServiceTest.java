package com.ticketingSystem.api.service;

import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.aryEq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class OciUploadServiceTest {

    @Test
    void interfaceContractCanBeMockedAndInvokedByCollaborators() throws Exception {
        OciUploadService uploadService = mock(OciUploadService.class);

        uploadService.uploadFile("ticket/path.txt", new byte[]{1, 2});
        uploadService.createPreauthenticatedRequest("ticket/path.txt", "ObjectRead", "download_1", "2030-01-01T00:00:00Z");

        // This verifies invocation signatures expected by service collaborators.
        verify(uploadService).uploadFile("ticket/path.txt", aryEq(new byte[]{1, 2}));
        verify(uploadService).createPreauthenticatedRequest("ticket/path.txt", "ObjectRead", "download_1", "2030-01-01T00:00:00Z");
    }
}
