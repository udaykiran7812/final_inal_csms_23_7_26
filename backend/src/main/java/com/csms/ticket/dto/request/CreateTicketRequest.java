package com.csms.ticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTicketRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String priority;

    private Long assetId;

    @NotNull
    private Long userId;

    @NotNull
    private Long departmentId;

    private Long subDepartmentId;

    @NotNull
    private Long issueCategoryId;

    private Long assignedStaffId;
}