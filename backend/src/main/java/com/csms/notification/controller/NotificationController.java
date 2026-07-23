package com.csms.notification.controller;

import com.csms.common.response.ApiResponse;
import com.csms.notification.dto.NotificationResponse;
import com.csms.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationService.getMyNotifications(email);
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<String> markAsRead(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationService.markAsRead(id, email);
    }
}
