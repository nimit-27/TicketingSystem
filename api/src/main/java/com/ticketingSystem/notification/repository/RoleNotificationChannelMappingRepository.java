package com.ticketingSystem.notification.repository;

import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.RoleNotificationChannelMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RoleNotificationChannelMappingRepository extends JpaRepository<RoleNotificationChannelMapping, Long> {
    @Query("""
            SELECT DISTINCT mapping.channelCode
            FROM RoleNotificationChannelMapping mapping
            WHERE mapping.role.roleId IN :roleIds
              AND mapping.notificationType.id = :notificationTypeId
              AND mapping.isActive = true
            """)
    List<ChannelType> findActiveChannelsForRoles(@Param("roleIds") Collection<Integer> roleIds,
                                                  @Param("notificationTypeId") Integer notificationTypeId);

    @Query("""
            SELECT mapping
            FROM RoleNotificationChannelMapping mapping
            JOIN FETCH mapping.role role
            JOIN FETCH mapping.notificationType notificationType
            WHERE role.isDeleted = false
              AND notificationType.isActive = true
            """)
    List<RoleNotificationChannelMapping> findGridMappings();

    Optional<RoleNotificationChannelMapping> findByRoleRoleIdAndNotificationTypeIdAndChannelCode(
            Integer roleId,
            Integer notificationTypeId,
            ChannelType channelCode
    );
}
