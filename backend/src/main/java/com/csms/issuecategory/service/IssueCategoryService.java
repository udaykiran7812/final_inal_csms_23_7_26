package com.csms.issuecategory.service;

import com.csms.common.response.ApiResponse;
import com.csms.issuecategory.dto.request.CreateIssueCategoryRequest;
import com.csms.issuecategory.dto.response.IssueCategoryResponse;

import java.util.List;

public interface IssueCategoryService {

    ApiResponse<IssueCategoryResponse> create(CreateIssueCategoryRequest request);

    ApiResponse<List<IssueCategoryResponse>> getAll();

    ApiResponse<IssueCategoryResponse> getById(Long id);

    ApiResponse<IssueCategoryResponse> update(Long id, CreateIssueCategoryRequest request);

    ApiResponse<String> delete(Long id);
}