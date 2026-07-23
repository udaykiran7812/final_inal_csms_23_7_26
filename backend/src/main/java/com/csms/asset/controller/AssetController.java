package com.csms.asset.controller;

import com.csms.common.response.ApiResponse;
import com.csms.asset.dto.AssetResponse;
import com.csms.asset.dto.CreateAssetRequest;
import com.csms.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','DEPARTMENT_ADMIN')")
    public ApiResponse<AssetResponse> createAsset(@Valid @RequestBody CreateAssetRequest request) {
        return assetService.createAsset(request);
    }

    @GetMapping
    public ApiResponse<List<AssetResponse>> getAllAssets() {
        return assetService.getAllAssets();
    }

    @GetMapping("/{id}")
    public ApiResponse<AssetResponse> getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }

    @GetMapping("/department/{departmentId}")
    public ApiResponse<List<AssetResponse>> getAssetsByDepartment(@PathVariable Long departmentId) {
        return assetService.getAssetsByDepartment(departmentId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','DEPARTMENT_ADMIN')")
    public ApiResponse<AssetResponse> updateAsset(@PathVariable Long id, @Valid @RequestBody CreateAssetRequest request) {
        return assetService.updateAsset(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ApiResponse<String> deleteAsset(@PathVariable Long id) {
        return assetService.deleteAsset(id);
    }

    @GetMapping("/{id}/history")
    public ApiResponse<List<com.csms.ticket.dto.response.TicketResponse>> getAssetTicketHistory(@PathVariable Long id) {
        return assetService.getAssetTicketHistory(id);
    }
}
