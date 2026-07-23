package com.csms.escalation.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EscalationRuleResponse {

    private Long id;
    private Long slaRuleId;
    private String priorityName;
    private String slaUserRole;
    private Integer triggerAfterMinutes;
    private Integer escalationLevel;
    private String notifyRole;
    private boolean active;
}
