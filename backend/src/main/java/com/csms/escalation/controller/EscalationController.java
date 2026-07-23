package com.csms.escalation.controller;

import com.csms.common.response.ApiResponse;
import com.csms.escalation.dto.request.CreateEscalationRuleRequest;
import com.csms.escalation.dto.response.EscalationHistoryResponse;
import com.csms.escalation.dto.response.EscalationRuleResponse;
import com.csms.escalation.service.EscalationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/escalation-rules")
@RequiredArgsConstructor
public class EscalationController {

    private final EscalationService escalationService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<EscalationRuleResponse> create(@Valid @RequestBody CreateEscalationRuleRequest request) {
        return escalationService.createRule(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','DEPARTMENT_ADMIN')")
    public ApiResponse<List<EscalationRuleResponse>> getAll() {
        return escalationService.getAllRules();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','DEPARTMENT_ADMIN')")
    public ApiResponse<EscalationRuleResponse> getById(@PathVariable Long id) {
        return escalationService.getRuleById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<EscalationRuleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateEscalationRuleRequest request) {
        return escalationService.updateRule(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        return escalationService.deleteRule(id);
    }

    @GetMapping("/tickets/{ticketId}/history")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','DEPARTMENT_ADMIN')")
    public ApiResponse<List<EscalationHistoryResponse>> getHistoryForTicket(@PathVariable Long ticketId) {
        return escalationService.getHistoryForTicket(ticketId);
    }
}
