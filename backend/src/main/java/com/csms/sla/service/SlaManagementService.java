package com.csms.sla.service;

import com.csms.common.response.ApiResponse;
import com.csms.sla.dto.request.CreateSlaRuleRequest;
import com.csms.sla.dto.response.SlaRuleResponse;

import java.util.List;

public interface SlaManagementService {

    ApiResponse<SlaRuleResponse> create(CreateSlaRuleRequest request);

    ApiResponse<List<SlaRuleResponse>> getAll();

    ApiResponse<SlaRuleResponse> getById(Long id);

    ApiResponse<SlaRuleResponse> update(Long id, CreateSlaRuleRequest request);

    ApiResponse<String> delete(Long id);
}
