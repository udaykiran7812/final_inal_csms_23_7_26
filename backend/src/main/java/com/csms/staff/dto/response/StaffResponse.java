package com.csms.staff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StaffResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private Long subDepartmentId;
    private String subDepartmentName;
    private Long roleId;
    private String roleName;
    private java.util.List<Long> roleIds;
    private java.util.List<String> roleNames;
    private java.util.List<Long> departmentIds;
    private java.util.List<String> departmentNames;
    private java.util.List<Long> subDepartmentIds;
    private java.util.List<String> subDepartmentNames;
}