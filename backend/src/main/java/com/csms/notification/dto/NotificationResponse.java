package com.csms.notification.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
