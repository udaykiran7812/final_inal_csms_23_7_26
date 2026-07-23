package com.csms.escalation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateEscalationRuleRequest {

    @NotNull(message = "SLA rule ID is required")
    private Long slaRuleId;

    @NotNull(message = "Trigger after minutes is required")
    @Positive(message = "Trigger after minutes must be positive")
    private Integer triggerAfterMinutes;

    @NotNull(message = "Escalation level is required")
    @Positive(message = "Escalation level must be positive")
    private Integer escalationLevel;

    @NotBlank(message = "Notify role is required")
    private String notifyRole;
}
