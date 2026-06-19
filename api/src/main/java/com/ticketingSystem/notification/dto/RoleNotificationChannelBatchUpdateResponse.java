package com.ticketingSystem.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleNotificationChannelBatchUpdateResponse {
    private int updated;
    private int created;
}
