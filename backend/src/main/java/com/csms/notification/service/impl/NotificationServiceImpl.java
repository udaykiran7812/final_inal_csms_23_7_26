package com.csms.notification.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.notification.dto.NotificationResponse;
import com.csms.notification.entity.Notification;
import com.csms.notification.repository.NotificationRepository;
import com.csms.notification.service.NotificationService;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void sendNotification(Long userId, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Notification notif = new Notification();
        notif.setUser(user);
        notif.setTitle(title);
        notif.setMessage(message);
        notificationRepository.save(notif);
    }

    @Override
    public void sendNotificationToRole(String roleName, Long departmentId, String title, String message) {
        List<User> recipients;
        if ("DEPARTMENT_ADMIN".equalsIgnoreCase(roleName) && departmentId != null) {
            recipients = userRepository.findByRole_NameAndDepartmentIdAndActiveTrue(roleName, departmentId);
        } else {
            recipients = userRepository.findByRole_NameAndActiveTrue(roleName);
        }

        for (User u : recipients) {
            Notification notif = new Notification();
            notif.setUser(u);
            notif.setTitle(title);
            notif.setMessage(message);
            notificationRepository.save(notif);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<NotificationResponse>> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        List<NotificationResponse> list = notificationRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ApiResponse.success("Notifications fetched successfully", list);
    }

    @Override
    public ApiResponse<String> markAsRead(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found: " + id));

        if (!notif.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot update another user's notification");
        }

        notif.setIsRead(true);
        notificationRepository.save(notif);

        return ApiResponse.success("Notification marked as read", null);
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setIsRead(n.getIsRead());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }
}
