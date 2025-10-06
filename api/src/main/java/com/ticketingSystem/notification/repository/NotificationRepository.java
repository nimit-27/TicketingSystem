package com.ticketingSystem.notification.repository;

import com.ticketingSystem.notification.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> { }

