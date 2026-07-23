package com.csms.department.mapper;

import com.csms.department.dto.request.CreateDepartmentRequest;
import com.csms.department.dto.response.DepartmentResponse;
import com.csms.department.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public Department toEntity(CreateDepartmentRequest request) {

        Department department = new Department();

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        return department;
    }

    public DepartmentResponse toResponse(Department department) {

        DepartmentResponse response = new DepartmentResponse();

        response.setId(department.getId());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setActive(department.getActive());

        return response;
    }
}