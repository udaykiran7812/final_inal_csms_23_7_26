package com.csms.asset.service;

import com.csms.common.response.ApiResponse;
import com.csms.asset.dto.AssetResponse;
import com.csms.asset.dto.CreateAssetRequest;

import java.util.List;

public interface AssetService {
    ApiResponse<AssetResponse> createAsset(CreateAssetRequest request);
    ApiResponse<List<AssetResponse>> getAllAssets();
    ApiResponse<AssetResponse> getAssetById(Long id);
    ApiResponse<List<AssetResponse>> getAssetsByDepartment(Long departmentId);
    ApiResponse<AssetResponse> updateAsset(Long id, CreateAssetRequest request);
    ApiResponse<String> deleteAsset(Long id);
    ApiResponse<List<com.csms.ticket.dto.response.TicketResponse>> getAssetTicketHistory(Long id);
}
