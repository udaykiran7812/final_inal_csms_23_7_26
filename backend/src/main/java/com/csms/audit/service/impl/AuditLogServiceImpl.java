package com.csms.audit.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.audit.dto.AuditLogResponse;
import com.csms.audit.entity.AuditLog;
import com.csms.audit.repository.AuditLogRepository;
import com.csms.audit.service.AuditLogService;
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
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public void logEvent(String userEmail, String action, String entityName, Long entityId, String oldValue, String newValue) {
        User user = userRepository.findByEmail(userEmail)
                .orElse(null);

        if (user == null) {
            // Fallback to superadmin user if event triggered system-wide or anonymous
            user = userRepository.findById(1L).orElse(null);
        }

        if (user != null) {
            AuditLog log = new AuditLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityName(entityName);
            log.setEntityId(entityId);
            log.setOldValue(oldValue);
            log.setNewValue(newValue);
            auditLogRepository.save(log);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AuditLogResponse>> getAuditLogs() {
        List<AuditLogResponse> logs = auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
        return ApiResponse.success("Audit logs fetched successfully", logs);
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        AuditLogResponse res = new AuditLogResponse();
        res.setId(log.getId());
        res.setUserId(log.getUser().getId());
        res.setUserName(log.getUser().getFirstName() + " " + (log.getUser().getLastName() != null ? log.getUser().getLastName() : ""));
        res.setUserEmail(log.getUser().getEmail());
        res.setUserRole(log.getUser().getRole().getName());
        res.setAction(log.getAction());
        res.setEntityName(log.getEntityName());
        res.setEntityId(log.getEntityId());
        res.setOldValue(log.getOldValue());
        res.setNewValue(log.getNewValue());
        res.setCreatedAt(log.getCreatedAt());
        return res;
    }
}
