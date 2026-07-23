package com.csms.staff.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateStaffRequest {

    @NotBlank(message = "Staff name is required")
    private String name;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    private String phone;

    private String password; // Optional login password for staff user account creation

    @NotNull(message = "Department is required")
    private Long departmentId;

    private Long subDepartmentId;

    private Long roleId;

    private java.util.List<Long> roleIds;

    private java.util.List<Long> departmentIds;

    private java.util.List<Long> subDepartmentIds;
}