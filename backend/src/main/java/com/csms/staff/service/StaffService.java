package com.csms.staff.service;

import com.csms.common.response.ApiResponse;
import com.csms.staff.dto.request.CreateStaffRequest;
import com.csms.staff.dto.response.StaffResponse;

import java.util.List;

public interface StaffService {

    ApiResponse<StaffResponse> create(CreateStaffRequest request);

    ApiResponse<List<StaffResponse>> getAll();

    ApiResponse<StaffResponse> getById(Long id);

    ApiResponse<StaffResponse> update(Long id, CreateStaffRequest request);

    ApiResponse<String> delete(Long id);
}