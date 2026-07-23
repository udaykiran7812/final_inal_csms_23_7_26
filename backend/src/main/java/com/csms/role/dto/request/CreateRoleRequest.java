package com.csms.role.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(max = 50)
    private String name;

    @Size(max = 255)
    private String description;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long subDepartmentId;
}