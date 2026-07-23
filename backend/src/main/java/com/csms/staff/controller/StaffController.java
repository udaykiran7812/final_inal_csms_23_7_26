package com.csms.staff.controller;

import com.csms.common.response.ApiResponse;
import com.csms.staff.dto.request.CreateStaffRequest;
import com.csms.staff.dto.response.StaffResponse;
import com.csms.staff.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN')")
    public ApiResponse<StaffResponse> create(@Valid @RequestBody CreateStaffRequest request) {
        return staffService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN')")
    public ApiResponse<List<StaffResponse>> getAll() {
        return staffService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN')")
    public ApiResponse<StaffResponse> getById(@PathVariable Long id) {
        return staffService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN')")
    public ApiResponse<StaffResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateStaffRequest request) {

        return staffService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        return staffService.delete(id);
    }
}