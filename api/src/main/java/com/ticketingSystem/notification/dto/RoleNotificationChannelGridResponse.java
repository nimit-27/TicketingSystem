package com.ticketingSystem.notification.dto;

import com.ticketingSystem.notification.enums.ChannelType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleNotificationChannelGridResponse {
    private List<RoleOption> roles;
    private List<NotificationOption> notifications;
    private List<MappingState> mappings;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleOption {
        private Integer roleId;
        private String role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationOption {
        private Integer notificationTypeId;
        private String name;
        private String code;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MappingState {
        private Integer roleId;
        private Integer notificationTypeId;
        private Map<ChannelType, Boolean> channels;
    }
}
