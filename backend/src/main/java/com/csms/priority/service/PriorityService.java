package com.csms.priority.service;

import com.csms.common.response.ApiResponse;
import com.csms.priority.dto.request.CreatePriorityRequest;
import com.csms.priority.dto.response.PriorityResponse;

import java.util.List;

public interface PriorityService {

    ApiResponse<PriorityResponse> create(CreatePriorityRequest request);

    ApiResponse<List<PriorityResponse>> getAll();

    ApiResponse<PriorityResponse> getById(Long id);

    ApiResponse<PriorityResponse> update(Long id, CreatePriorityRequest request);

    ApiResponse<String> delete(Long id);
}
