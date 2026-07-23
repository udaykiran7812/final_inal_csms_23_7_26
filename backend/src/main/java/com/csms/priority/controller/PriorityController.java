package com.csms.priority.controller;

import com.csms.common.response.ApiResponse;
import com.csms.priority.dto.request.CreatePriorityRequest;
import com.csms.priority.dto.response.PriorityResponse;
import com.csms.priority.service.PriorityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Priority configuration is a Super Admin-only capability.
 * All roles may read priorities (needed to render tickets/SLA info),
 * but only SUPER_ADMIN can create, modify, or retire them.
 */
@RestController
@RequestMapping("/api/v1/priorities")
@RequiredArgsConstructor
public class PriorityController {

    private final PriorityService priorityService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<PriorityResponse> create(@Valid @RequestBody CreatePriorityRequest request) {
        return priorityService.create(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<PriorityResponse>> getAll() {
        return priorityService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PriorityResponse> getById(@PathVariable Long id) {
        return priorityService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<PriorityResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreatePriorityRequest request) {
        return priorityService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        return priorityService.delete(id);
    }
}
