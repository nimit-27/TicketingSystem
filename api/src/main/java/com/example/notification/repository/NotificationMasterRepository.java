package com.example.notification.repository;

import com.example.notification.models.NotificationMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationMasterRepository extends JpaRepository<NotificationMaster, Integer> {
    Optional<NotificationMaster> findByCodeAndIsActiveTrue(String code);
}
