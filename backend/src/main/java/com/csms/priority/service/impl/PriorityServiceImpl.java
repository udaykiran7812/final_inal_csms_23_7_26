package com.csms.priority.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.priority.dto.request.CreatePriorityRequest;
import com.csms.priority.dto.response.PriorityResponse;
import com.csms.priority.entity.Priority;
import com.csms.priority.mapper.PriorityMapper;
import com.csms.priority.repository.PriorityRepository;
import com.csms.priority.service.PriorityService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Priority is a global configuration owned exclusively by Super Admin
 * (per business vision: "Super Admin is the ONLY person who can modify
 * ... Priority rules"). This service intentionally has no department
 * scoping - priorities are system-wide.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PriorityServiceImpl implements PriorityService {

    private final PriorityRepository priorityRepository;
    private final PriorityMapper priorityMapper;

    @Override
    public ApiResponse<PriorityResponse> create(CreatePriorityRequest request) {

        if (priorityRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Priority already exists: " + request.getName());
        }

        Priority priority = priorityMapper.toEntity(request);
        priority = priorityRepository.save(priority);

        return ApiResponse.success(
                "Priority created successfully",
                priorityMapper.toResponse(priority)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PriorityResponse>> getAll() {

        List<PriorityResponse> priorities = priorityRepository.findByActiveTrueOrderByIdAsc()
                .stream()
                .map(priorityMapper::toResponse)
                .toList();

        return ApiResponse.success("Priorities fetched successfully", priorities);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PriorityResponse> getById(Long id) {

        Priority priority = priorityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Priority not found"));

        return ApiResponse.success("Priority fetched successfully", priorityMapper.toResponse(priority));
    }

    @Override
    public ApiResponse<PriorityResponse> update(Long id, CreatePriorityRequest request) {

        Priority priority = priorityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Priority not found"));

        priorityRepository.findByName(request.getName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Priority already exists: " + request.getName());
                });

        priority.setName(request.getName());
        priority.setDisplayColor(request.getDisplayColor());

        priority = priorityRepository.save(priority);

        return ApiResponse.success("Priority updated successfully", priorityMapper.toResponse(priority));
    }

    @Override
    public ApiResponse<String> delete(Long id) {

        Priority priority = priorityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Priority not found"));

        priority.setActive(false);
        priorityRepository.save(priority);

        return ApiResponse.success("Priority deleted successfully", null);
    }
}
