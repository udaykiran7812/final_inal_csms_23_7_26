package com.csms.escalation.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EscalationHistoryResponse {

    private Long id;
    private Long ticketId;
    private Integer escalationLevel;
    private Long notifiedUserId;
    private String notifiedUserName;
    private LocalDateTime triggeredAt;
}
