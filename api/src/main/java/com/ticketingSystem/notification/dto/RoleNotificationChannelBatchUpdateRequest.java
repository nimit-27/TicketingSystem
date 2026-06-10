package com.ticketingSystem.notification.dto;

import com.ticketingSystem.notification.enums.ChannelType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RoleNotificationChannelBatchUpdateRequest {
    private String updatedBy;

    @Valid
    @NotEmpty
    private List<Item> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Item {
        @NotNull
        private Integer roleId;

        @NotNull
        private Integer notificationTypeId;

        @NotNull
        private ChannelType channelCode;

        @NotNull
        private Boolean isActive;
    }
}
