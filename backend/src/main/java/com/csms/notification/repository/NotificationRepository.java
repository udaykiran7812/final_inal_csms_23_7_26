package com.csms.notification.repository;

import com.csms.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndIsReadFalseAndActiveTrueOrderByCreatedAtDesc(Long userId);
}
