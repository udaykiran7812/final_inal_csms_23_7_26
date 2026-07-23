package com.csms.department.service;

import com.csms.common.response.ApiResponse;
import com.csms.department.dto.request.CreateDepartmentRequest;
import com.csms.department.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    ApiResponse<DepartmentResponse> create(CreateDepartmentRequest request);

    ApiResponse<List<DepartmentResponse>> getAll();

    ApiResponse<DepartmentResponse> getById(Long id);

    ApiResponse<DepartmentResponse> update(Long id, CreateDepartmentRequest request);

    ApiResponse<String> delete(Long id);

}