package com.csms.subdepartment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubDepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private Long departmentId;
    private String departmentName;
    private boolean active;
}
