package com.csms.subdepartment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSubDepartmentRequest {

    @NotBlank(message = "SubDepartment name is required")
    private String name;

    private String description;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}
