package com.csms.department.controller;

import com.csms.common.response.ApiResponse;
import com.csms.department.dto.request.CreateDepartmentRequest;
import com.csms.department.dto.response.DepartmentResponse;
import com.csms.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<DepartmentResponse> create(
            @Valid @RequestBody CreateDepartmentRequest request) {

        return departmentService.create(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<DepartmentResponse>> getAll() {

        return departmentService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<DepartmentResponse> getById(
            @PathVariable Long id) {

        return departmentService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<DepartmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateDepartmentRequest request) {

        return departmentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<String> delete(
            @PathVariable Long id) {

        return departmentService.delete(id);
    }
}