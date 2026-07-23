package com.csms.ticket.dto.response;

import com.csms.common.enums.TicketStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private String priority;
    private String userName;
    private Long departmentId;
    private String departmentName;
    private Long subDepartmentId;
    private String subDepartmentName;
    private String issueCategoryName;
    private String assignedStaffName;
    private Long assetId;
    private String assetName;
    private java.time.LocalDateTime slaResponseDeadline;
    private java.time.LocalDateTime slaResolutionDeadline;
    private java.time.LocalDateTime respondedAt;
    private java.time.LocalDateTime resolvedAt;
    private Boolean slaBreached;
}