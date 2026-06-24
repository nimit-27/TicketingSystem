package com.ticketingSystem.api.dto.requestersync;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RequesterUserSyncBatchRequest {
    @NotBlank
    private String sourceSystem;
    @NotBlank
    private String batchId;
    private String schemaVersion;
    @NotEmpty
    @Size(max = 1000)
    @Valid
    private List<RequesterUserSyncRecordRequest> records;
}
