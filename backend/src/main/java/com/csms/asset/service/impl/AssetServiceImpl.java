package com.csms.asset.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.asset.dto.AssetResponse;
import com.csms.asset.dto.CreateAssetRequest;
import com.csms.asset.entity.Asset;
import com.csms.asset.repository.AssetRepository;
import com.csms.asset.service.AssetService;
import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final DepartmentRepository departmentRepository;
    private final com.csms.ticket.repository.TicketRepository ticketRepository;
    private final com.csms.ticket.mapper.TicketMapper ticketMapper;

    @Override
    public ApiResponse<AssetResponse> createAsset(CreateAssetRequest request) {
        if (assetRepository.findByAssetTag(request.getAssetTag()).isPresent()) {
            throw new IllegalArgumentException("Asset tag already exists: " + request.getAssetTag());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + request.getDepartmentId()));

        Asset asset = new Asset();
        asset.setName(request.getName());
        asset.setAssetTag(request.getAssetTag());
        asset.setType(request.getType());
        asset.setLocation(request.getLocation());
        asset.setDepartment(department);
        asset.setStatus(request.getStatus());

        asset = assetRepository.save(asset);

        return ApiResponse.success("Asset registered successfully", mapToResponse(asset));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AssetResponse>> getAllAssets() {
        List<AssetResponse> list = assetRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
        return ApiResponse.success("Assets fetched successfully", list);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AssetResponse> getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found: " + id));
        return ApiResponse.success("Asset fetched successfully", mapToResponse(asset));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AssetResponse>> getAssetsByDepartment(Long departmentId) {
        List<AssetResponse> list = assetRepository.findByActiveTrue()
                .stream()
                .filter(a -> a.getDepartment().getId().equals(departmentId))
                .map(this::mapToResponse)
                .toList();
        return ApiResponse.success("Department assets fetched successfully", list);
    }

    @Override
    public ApiResponse<AssetResponse> updateAsset(Long id, CreateAssetRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + request.getDepartmentId()));

        asset.setName(request.getName());
        asset.setAssetTag(request.getAssetTag());
        asset.setType(request.getType());
        asset.setLocation(request.getLocation());
        asset.setDepartment(department);
        asset.setStatus(request.getStatus());

        asset = assetRepository.save(asset);

        return ApiResponse.success("Asset updated successfully", mapToResponse(asset));
    }

    @Override
    public ApiResponse<String> deleteAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found: " + id));

        asset.setActive(false);
        assetRepository.save(asset);

        return ApiResponse.success("Asset deleted successfully", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<com.csms.ticket.dto.response.TicketResponse>> getAssetTicketHistory(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found: " + id));

        List<com.csms.ticket.dto.response.TicketResponse> tickets = ticketRepository.findByAssetIdAndActiveTrue(id)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();

        return ApiResponse.success("Asset ticket service history fetched successfully", tickets);
    }

    private AssetResponse mapToResponse(Asset asset) {
        AssetResponse res = new AssetResponse();
        res.setId(asset.getId());
        res.setName(asset.getName());
        res.setAssetTag(asset.getAssetTag());
        res.setType(asset.getType());
        res.setLocation(asset.getLocation());
        res.setDepartmentId(asset.getDepartment().getId());
        res.setDepartmentName(asset.getDepartment().getName());
        res.setStatus(asset.getStatus());
        res.setActive(asset.getActive());
        res.setCreatedAt(asset.getCreatedAt());
        return res;
    }
}
