package com.csms.issuecategory.mapper;

import com.csms.issuecategory.dto.request.CreateIssueCategoryRequest;
import com.csms.issuecategory.dto.response.IssueCategoryResponse;
import com.csms.issuecategory.entity.IssueCategory;
import org.springframework.stereotype.Component;

@Component
public class IssueCategoryMapper {

    public IssueCategory toEntity(CreateIssueCategoryRequest request) {

        IssueCategory category = new IssueCategory();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return category;
    }

    public IssueCategoryResponse toResponse(IssueCategory category) {

        IssueCategoryResponse response = new IssueCategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());

        return response;
    }
}