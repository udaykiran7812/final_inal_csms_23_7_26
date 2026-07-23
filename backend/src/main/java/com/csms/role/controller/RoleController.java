package com.csms.role.controller;

import com.csms.common.response.ApiResponse;
import com.csms.role.dto.request.CreateRoleRequest;
import com.csms.role.dto.response.RoleResponse;
import com.csms.role.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<RoleResponse> createRole(@Valid @RequestBody CreateRoleRequest request) {
        return ApiResponse.success(
                "Role created successfully",
                roleService.createRole(request)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.success(
                "Roles fetched successfully",
                roleService.getAllRoles()
        );
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<RoleResponse>> getRolesByDepartmentId(@PathVariable Long departmentId) {
        return ApiResponse.success(
                "Roles fetched for department successfully",
                roleService.getRolesByDepartmentId(departmentId)
        );
    }

    @GetMapping("/sub-department/{subDepartmentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<RoleResponse>> getRolesBySubDepartmentId(@PathVariable Long subDepartmentId) {
        return ApiResponse.success(
                "Roles fetched for sub-department successfully",
                roleService.getRolesBySubDepartmentId(subDepartmentId)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<RoleResponse> getRoleById(@PathVariable Long id) {
        return ApiResponse.success(
                "Role fetched successfully",
                roleService.getRoleById(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody CreateRoleRequest request) {
        return ApiResponse.success(
                "Role updated successfully",
                roleService.updateRole(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<String> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ApiResponse.success(
                "Role deleted successfully",
                "Deleted Role ID: " + id
        );
    }
}