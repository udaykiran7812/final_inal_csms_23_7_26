package com.csms.role.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoleResponse {

    private Long id;
    private String name;
    private String description;
    private Boolean active;
    private Long departmentId;
    private String departmentName;
    private Long subDepartmentId;
    private String subDepartmentName;
}