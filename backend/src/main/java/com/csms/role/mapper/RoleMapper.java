package com.csms.role.mapper;

import com.csms.role.dto.request.CreateRoleRequest;
import com.csms.role.dto.response.RoleResponse;
import com.csms.role.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public Role toEntity(CreateRoleRequest request) {
        Role role = new Role();
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        return role;
    }

    public RoleResponse toResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setDescription(role.getDescription());
        response.setActive(role.getActive());

        if (role.getDepartment() != null) {
            response.setDepartmentId(role.getDepartment().getId());
            response.setDepartmentName(role.getDepartment().getName());
        }

        if (role.getSubDepartment() != null) {
            response.setSubDepartmentId(role.getSubDepartment().getId());
            response.setSubDepartmentName(role.getSubDepartment().getName());
        }

        return response;
    }
}