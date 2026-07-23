package com.csms.issuecategory.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.issuecategory.dto.request.CreateIssueCategoryRequest;
import com.csms.issuecategory.dto.response.IssueCategoryResponse;
import com.csms.issuecategory.entity.IssueCategory;
import com.csms.issuecategory.mapper.IssueCategoryMapper;
import com.csms.issuecategory.repository.IssueCategoryRepository;
import com.csms.issuecategory.service.IssueCategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueCategoryServiceImpl implements IssueCategoryService {

    private final IssueCategoryRepository issueCategoryRepository;
    private final IssueCategoryMapper issueCategoryMapper;

    @Override
    public ApiResponse<IssueCategoryResponse> create(CreateIssueCategoryRequest request) {

        if (issueCategoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Issue category already exists");
        }

        IssueCategory category = issueCategoryMapper.toEntity(request);

        category = issueCategoryRepository.save(category);

        return ApiResponse.success(
                "Issue category created successfully",
                issueCategoryMapper.toResponse(category)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<IssueCategoryResponse>> getAll() {

        List<IssueCategoryResponse> categories = issueCategoryRepository.findByActiveTrue()
                .stream()
                .map(issueCategoryMapper::toResponse)
                .toList();

        return ApiResponse.success(
                "Issue categories fetched successfully",
                categories
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<IssueCategoryResponse> getById(Long id) {

        IssueCategory category = issueCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Issue category not found"));

        return ApiResponse.success(
                "Issue category fetched successfully",
                issueCategoryMapper.toResponse(category)
        );
    }

    @Override
    public ApiResponse<IssueCategoryResponse> update(Long id, CreateIssueCategoryRequest request) {

        IssueCategory category = issueCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Issue category not found"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        category = issueCategoryRepository.save(category);

        return ApiResponse.success(
                "Issue category updated successfully",
                issueCategoryMapper.toResponse(category)
        );
    }

    @Override
    public ApiResponse<String> delete(Long id) {

        IssueCategory category = issueCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Issue category not found"));

        category.setActive(false);

        issueCategoryRepository.save(category);

        return ApiResponse.success(
                "Issue category deleted successfully",
                null
        );
    }
}