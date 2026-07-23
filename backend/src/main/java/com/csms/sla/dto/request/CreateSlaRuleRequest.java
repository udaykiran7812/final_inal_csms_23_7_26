package com.csms.sla.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSlaRuleRequest {

    private Long departmentId;

    private Long subDepartmentId;

    @NotNull(message = "Priority ID is required")
    private Long priorityId;

    private String userRole;

    @NotNull(message = "Response time limit in minutes is required")
    private Integer responseTimeLimitMinutes;

    @NotNull(message = "Resolution time limit in minutes is required")
    private Integer resolutionTimeLimitMinutes;
}
