package com.csms.escalation.service;

import com.csms.common.response.ApiResponse;
import com.csms.escalation.dto.request.CreateEscalationRuleRequest;
import com.csms.escalation.dto.response.EscalationHistoryResponse;
import com.csms.escalation.dto.response.EscalationRuleResponse;

import java.util.List;

public interface EscalationService {

    ApiResponse<EscalationRuleResponse> createRule(CreateEscalationRuleRequest request);

    ApiResponse<List<EscalationRuleResponse>> getAllRules();

    ApiResponse<EscalationRuleResponse> getRuleById(Long id);

    ApiResponse<EscalationRuleResponse> updateRule(Long id, CreateEscalationRuleRequest request);

    ApiResponse<String> deleteRule(Long id);

    ApiResponse<List<EscalationHistoryResponse>> getHistoryForTicket(Long ticketId);
}
