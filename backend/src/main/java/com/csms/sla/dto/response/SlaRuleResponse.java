package com.csms.sla.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SlaRuleResponse {

    private Long id;
    private Long departmentId;
    private String departmentName;
    private Long subDepartmentId;
    private String subDepartmentName;
    private Long priorityId;
    private String priorityName;
    private String userRole;
    private Integer responseTimeLimitMinutes;
    private Integer resolutionTimeLimitMinutes;
    private boolean active;
}
