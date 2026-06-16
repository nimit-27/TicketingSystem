package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.models.GenericUser;
import com.ticketingSystem.notification.config.NotificationProperties;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.repository.NotificationMasterRepository;
import com.ticketingSystem.notification.repository.RoleNotificationChannelMappingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final List<Notifier> notifiers;
    private final NotificationProperties properties;
    private final NotificationRuntimeToggleService notificationRuntimeToggleService;
    private final NotificationMasterRepository notificationMasterRepository;
    private final RoleNotificationChannelMappingRepository roleNotificationChannelMappingRepository;

    public void sendNotification(ChannelType channel, String notificationCode, Map<String, Object> dataModel, String recipient) throws Exception {
        if (!notificationRuntimeToggleService.isNotificationEnabled()) {
            log.info("Notification dispatch skipped because notifications are globally disabled. channel={}, notificationCode={}, recipient={}", channel, notificationCode, recipient);
            return;
        }

        Notifier notifier = notifiers.stream()
                .filter(n -> n.getChannel() == channel)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported channel " + channel));

        NotificationMaster notificationMaster = notificationMasterRepository
                .findByCodeAndIsActiveTrue(notificationCode)
                .orElseThrow(() -> new IllegalArgumentException("No active notification found for code " + notificationCode));

        Map<String, Object> model = dataModel == null ? new HashMap<>() : new HashMap<>(dataModel);
        if (!model.containsKey("supportEmail") && properties.getSupportEmail() != null) {
            model.put("supportEmail", properties.getSupportEmail());
        }

        if (channel == ChannelType.IN_APP) {
            enrichInAppPayload(model);
        }

        String templateName = null;
        if (channel != ChannelType.IN_APP) {
            templateName = resolveTemplateName(notificationMaster, channel);
        }

        NotificationRequest request = new NotificationRequest(
                channel,
                notificationMaster,
                recipient,
                templateName,
                model
        );

        notifier.send(request);
    }

    /**
     * Sends all channels configured for the recipient user's roles and notification code.
     * If no active role/channel mapping exists, the notification is not sent.
     */
    public void sendNotificationForUser(String notificationCode, Map<String, Object> dataModel, GenericUser recipientUser) throws Exception {
        if (!notificationRuntimeToggleService.isNotificationEnabled()) {
            log.info("Role-aware notification dispatch skipped because notifications are globally disabled. notificationCode={}, userId={}",
                    notificationCode, recipientUser != null ? recipientUser.getGenericUserId() : null);
            return;
        }

        if (recipientUser == null || recipientUser.getGenericUserId() == null || recipientUser.getGenericUserId().isBlank()) {
            log.warn("Role-aware notification dispatch skipped because recipient user/userId is missing. notificationCode={}", notificationCode);
            return;
        }

        NotificationMaster notificationMaster = notificationMasterRepository
                .findByCodeAndIsActiveTrue(notificationCode)
                .orElseThrow(() -> new IllegalArgumentException("No active notification found for code " + notificationCode));

        Set<Integer> roleIds = resolveRoleIds(recipientUser);
        if (roleIds.isEmpty()) {
            log.info("Role-aware notification dispatch skipped because user has no role ids. notificationCode={}, userId={}",
                    notificationCode, recipientUser.getGenericUserId());
            return;
        }

        List<ChannelType> channels = roleNotificationChannelMappingRepository
                .findActiveChannelsForRoles(roleIds, notificationMaster.getId());

        if (channels.isEmpty()) {
            log.info("Role-aware notification dispatch skipped because no active role/channel mapping exists. notificationCode={}, userId={}, roleIds={}",
                    notificationCode, recipientUser.getGenericUserId(), roleIds);
            return;
        }

        for (ChannelType channel : channels) {
            String recipient = resolveRecipientIdentifier(recipientUser, channel);
            if (recipient == null || recipient.isBlank()) {
                log.warn("Role-aware notification channel skipped because recipient identifier is missing. channel={}, notificationCode={}, userId={}",
                        channel, notificationCode, recipientUser.getGenericUserId());
                continue;
            }
            sendNotification(channel, notificationCode, dataModel, recipient);
        }
    }

    private Set<Integer> resolveRoleIds(GenericUser user) {
        if (user == null || user.getRoles() == null || user.getRoles().isBlank()) {
            return Set.of();
        }

        Set<Integer> roleIds = new LinkedHashSet<>();
        Arrays.stream(user.getRoles().split("\\|"))
                .map(role -> role == null ? "" : role.trim())
                .filter(role -> !role.isBlank())
                .map(this::parseRoleId)
                .filter(Objects::nonNull)
                .forEach(roleIds::add);
        return roleIds;
    }

    private Integer parseRoleId(String role) {
        try {
            return Integer.valueOf(role);
        } catch (NumberFormatException ex) {
            log.warn("Ignoring non-numeric role id in role-aware notification mapping: {}", role);
            return null;
        }
    }

    private String resolveRecipientIdentifier(GenericUser user, ChannelType channel) {
        if (user == null) {
            return null;
        }
        if (channel == ChannelType.SMS) {
            return firstNonBlank(user.getMobileNo(), user.getGenericUserId());
        }
        return firstNonBlank(user.getGenericUserId(), user.getUsername(), user.getEmailId());
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private String resolveTemplateName(NotificationMaster notificationMaster, ChannelType channel) {
        String templateName = switch (channel) {
            case EMAIL -> notificationMaster.getEmailTemplate();
            case SMS -> notificationMaster.getSmsTemplate();
            case IN_APP -> notificationMaster.getInappTemplate();
        };

        if (templateName == null || templateName.isBlank()) {
            throw new IllegalStateException("No template configured for channel " + channel + " in notification code " + notificationMaster.getCode());
        }

        return templateName;
    }

    private void enrichInAppPayload(Map<String, Object> model) {
        if (model == null) {
            return;
        }

        Object ticketId = model.get("ticketId");
        if (ticketId != null && !model.containsKey("redirectUrl")) {
            model.put("redirectUrl", "/tickets/" + ticketId.toString());
        }
    }
}
