package com.csms.subdepartment.service;

import com.csms.common.response.ApiResponse;
import com.csms.subdepartment.dto.request.CreateSubDepartmentRequest;
import com.csms.subdepartment.dto.response.SubDepartmentResponse;

import java.util.List;

public interface SubDepartmentService {

    ApiResponse<SubDepartmentResponse> create(CreateSubDepartmentRequest request);

    ApiResponse<List<SubDepartmentResponse>> getAll();

    ApiResponse<List<SubDepartmentResponse>> getByDepartmentId(Long departmentId);

    ApiResponse<SubDepartmentResponse> getById(Long id);

    ApiResponse<SubDepartmentResponse> update(Long id, CreateSubDepartmentRequest request);

    ApiResponse<String> delete(Long id);
}
