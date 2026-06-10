package com.ticketingSystem.notification.service;

import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.notification.dto.RoleNotificationChannelBatchUpdateRequest;
import com.ticketingSystem.notification.dto.RoleNotificationChannelBatchUpdateResponse;
import com.ticketingSystem.notification.dto.RoleNotificationChannelGridResponse;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.NotificationMaster;
import com.ticketingSystem.notification.models.RoleNotificationChannelMapping;
import com.ticketingSystem.notification.repository.NotificationMasterRepository;
import com.ticketingSystem.notification.repository.RoleNotificationChannelMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoleNotificationChannelMappingService {
    private static final String DEFAULT_AUDITOR = "SYSTEM";

    private final RoleRepository roleRepository;
    private final NotificationMasterRepository notificationMasterRepository;
    private final RoleNotificationChannelMappingRepository mappingRepository;

    @Transactional(readOnly = true)
    public RoleNotificationChannelGridResponse getGrid() {
        List<RoleNotificationChannelGridResponse.RoleOption> roles = roleRepository.findByIsDeletedFalseOrderByRoleAsc()
                .stream()
                .map(role -> new RoleNotificationChannelGridResponse.RoleOption(role.getRoleId(), role.getRole()))
                .toList();

        List<RoleNotificationChannelGridResponse.NotificationOption> notifications = notificationMasterRepository
                .findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(notification -> new RoleNotificationChannelGridResponse.NotificationOption(
                        notification.getId(),
                        notification.getName(),
                        notification.getCode(),
                        notification.getDescription()
                ))
                .toList();

        Map<String, RoleNotificationChannelGridResponse.MappingState> mappingStates = new LinkedHashMap<>();
        for (RoleNotificationChannelMapping mapping : mappingRepository.findGridMappings()) {
            Integer roleId = mapping.getRole().getRoleId();
            Integer notificationTypeId = mapping.getNotificationType().getId();
            String key = key(roleId, notificationTypeId);
            RoleNotificationChannelGridResponse.MappingState state = mappingStates.computeIfAbsent(
                    key,
                    ignored -> new RoleNotificationChannelGridResponse.MappingState(
                            roleId,
                            notificationTypeId,
                            emptyChannelMap()
                    )
            );
            state.getChannels().put(mapping.getChannelCode(), Boolean.TRUE.equals(mapping.getIsActive()));
        }

        List<RoleNotificationChannelGridResponse.MappingState> mappings = new ArrayList<>(mappingStates.values());
        mappings.sort(Comparator
                .comparing(RoleNotificationChannelGridResponse.MappingState::getNotificationTypeId)
                .thenComparing(RoleNotificationChannelGridResponse.MappingState::getRoleId));

        return new RoleNotificationChannelGridResponse(roles, notifications, mappings);
    }

    @Transactional
    public RoleNotificationChannelBatchUpdateResponse batchUpdate(RoleNotificationChannelBatchUpdateRequest request) {
        int updated = 0;
        int created = 0;
        String auditor = request.getUpdatedBy() == null || request.getUpdatedBy().isBlank()
                ? DEFAULT_AUDITOR
                : request.getUpdatedBy().trim();

        for (RoleNotificationChannelBatchUpdateRequest.Item item : request.getItems()) {
            RoleNotificationChannelMapping mapping = mappingRepository
                    .findByRoleRoleIdAndNotificationTypeIdAndChannelCode(
                            item.getRoleId(),
                            item.getNotificationTypeId(),
                            item.getChannelCode()
                    )
                    .orElse(null);

            if (mapping == null) {
                mapping = new RoleNotificationChannelMapping();
                mapping.setRole(resolveRole(item.getRoleId()));
                mapping.setNotificationType(resolveNotification(item.getNotificationTypeId()));
                mapping.setChannelCode(item.getChannelCode());
                mapping.setCreatedBy(auditor);
                created++;
            } else {
                updated++;
            }

            mapping.setIsActive(Boolean.TRUE.equals(item.getIsActive()));
            mapping.setUpdatedBy(auditor);
            mappingRepository.save(mapping);
        }

        return new RoleNotificationChannelBatchUpdateResponse(updated, created);
    }

    private Role resolveRole(Integer roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));
        if (role.isDeleted()) {
            throw new ResourceNotFoundException("Role", roleId);
        }
        return role;
    }

    private NotificationMaster resolveNotification(Integer notificationTypeId) {
        NotificationMaster notification = notificationMasterRepository.findById(notificationTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationMaster", notificationTypeId));
        if (!Boolean.TRUE.equals(notification.getIsActive())) {
            throw new ResourceNotFoundException("NotificationMaster", notificationTypeId);
        }
        return notification;
    }

    private Map<ChannelType, Boolean> emptyChannelMap() {
        Map<ChannelType, Boolean> channels = new EnumMap<>(ChannelType.class);
        for (ChannelType channelType : ChannelType.values()) {
            channels.put(channelType, Boolean.FALSE);
        }
        return channels;
    }

    private String key(Integer roleId, Integer notificationTypeId) {
        return roleId + ":" + notificationTypeId;
    }
}
