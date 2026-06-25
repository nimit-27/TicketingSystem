package com.ticketingSystem.api.dto.requestersync;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RequesterUserSyncBatchRequest {
    @NotNull
    private Long requestId;

    private String sourceSystem;

    @NotEmpty
    @Size(max = 1000)
    private List<RequesterUserSyncRecordRequest> users;
}
