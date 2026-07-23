package com.csms.subdepartment.controller;

import com.csms.common.response.ApiResponse;
import com.csms.subdepartment.dto.request.CreateSubDepartmentRequest;
import com.csms.subdepartment.dto.response.SubDepartmentResponse;
import com.csms.subdepartment.service.SubDepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sub-departments")
@RequiredArgsConstructor
public class SubDepartmentController {

    private final SubDepartmentService subDepartmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<SubDepartmentResponse> create(@Valid @RequestBody CreateSubDepartmentRequest request) {
        return subDepartmentService.create(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<SubDepartmentResponse>> getAll() {
        return subDepartmentService.getAll();
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<SubDepartmentResponse>> getByDepartmentId(@PathVariable Long departmentId) {
        return subDepartmentService.getByDepartmentId(departmentId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<SubDepartmentResponse> getById(@PathVariable Long id) {
        return subDepartmentService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<SubDepartmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateSubDepartmentRequest request) {
        return subDepartmentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        return subDepartmentService.delete(id);
    }
}
