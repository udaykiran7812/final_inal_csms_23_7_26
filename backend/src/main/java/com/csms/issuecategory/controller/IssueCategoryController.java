package com.csms.issuecategory.controller;

import com.csms.common.response.ApiResponse;
import com.csms.issuecategory.dto.request.CreateIssueCategoryRequest;
import com.csms.issuecategory.dto.response.IssueCategoryResponse;
import com.csms.issuecategory.service.IssueCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/issue-categories")
@RequiredArgsConstructor
public class IssueCategoryController {

    private final IssueCategoryService issueCategoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<IssueCategoryResponse> create(
            @Valid @RequestBody CreateIssueCategoryRequest request) {

        return issueCategoryService.create(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<IssueCategoryResponse>> getAll() {
        return issueCategoryService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<IssueCategoryResponse> getById(@PathVariable Long id) {
        return issueCategoryService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<IssueCategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateIssueCategoryRequest request) {

        return issueCategoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        return issueCategoryService.delete(id);
    }
}