package com.ticketingSystem.notification.repository;

import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.models.RoleNotificationChannelMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

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
}
