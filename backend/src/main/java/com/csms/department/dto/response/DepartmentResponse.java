package com.csms.department.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentResponse {

    private Long id;

    private String name;

    private String description;

    private Boolean active;

    private String adminEmail;

    private String adminName;
}