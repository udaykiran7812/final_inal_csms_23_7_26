package com.csms.notification.service;

import com.csms.common.response.ApiResponse;
import com.csms.notification.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    void sendNotification(Long userId, String title, String message);
    void sendNotificationToRole(String roleName, Long departmentId, String title, String message);
    ApiResponse<List<NotificationResponse>> getMyNotifications(String email);
    ApiResponse<String> markAsRead(Long id, String email);
}
