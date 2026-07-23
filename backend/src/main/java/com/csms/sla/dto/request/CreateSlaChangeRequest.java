package com.csms.sla.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSlaChangeRequest {

    @NotBlank(message = "Priority name is required")
    private String priorityName;

    @NotBlank(message = "User role is required")
    private String userRole;

    @NotNull(message = "Proposed response time limit is required")
    private Integer proposedResponseTimeLimitMinutes;

    @NotNull(message = "Proposed resolution time limit is required")
    private Integer proposedResolutionTimeLimitMinutes;

    private String justification;
}
