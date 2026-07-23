package com.csms.audit.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private String action;
    private String entityName;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;
}
