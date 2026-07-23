package com.csms.sla.controller;

import com.csms.common.response.ApiResponse;
import com.csms.sla.dto.request.CreateSlaRuleRequest;
import com.csms.sla.dto.response.SlaRuleResponse;
import com.csms.sla.service.SlaManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sla-rules")
@RequiredArgsConstructor
public class SlaRuleController {

    private final SlaManagementService slaManagementService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<SlaRuleResponse> create(@Valid @RequestBody CreateSlaRuleRequest request) {
        return slaManagementService.create(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<SlaRuleResponse>> getAll() {
        return slaManagementService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<SlaRuleResponse> getById(@PathVariable Long id) {
        return slaManagementService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<SlaRuleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateSlaRuleRequest request) {
        return slaManagementService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        return slaManagementService.delete(id);
    }
}
