package com.csms.role.service;

import com.csms.role.dto.request.CreateRoleRequest;
import com.csms.role.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {

    RoleResponse createRole(CreateRoleRequest request);

    List<RoleResponse> getAllRoles();

    List<RoleResponse> getRolesByDepartmentId(Long departmentId);

    List<RoleResponse> getRolesBySubDepartmentId(Long subDepartmentId);

    RoleResponse getRoleById(Long id);

    RoleResponse updateRole(Long id, CreateRoleRequest request);

    void deleteRole(Long id);
}