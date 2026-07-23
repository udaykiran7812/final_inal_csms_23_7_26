package com.csms.sla.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SlaChangeRequestResponse {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private String priorityName;
    private String userRole;
    private Integer proposedResponseTimeLimitMinutes;
    private Integer proposedResolutionTimeLimitMinutes;
    private String justification;
    private String status;
    private String adminNotes;
    private LocalDateTime createdAt;
}
