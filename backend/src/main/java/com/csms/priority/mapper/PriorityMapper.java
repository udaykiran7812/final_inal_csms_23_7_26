package com.csms.priority.mapper;

import com.csms.priority.dto.request.CreatePriorityRequest;
import com.csms.priority.dto.response.PriorityResponse;
import com.csms.priority.entity.Priority;
import org.springframework.stereotype.Component;

@Component
public class PriorityMapper {

    public Priority toEntity(CreatePriorityRequest request) {

        Priority priority = new Priority();

        priority.setName(request.getName());
        priority.setDisplayColor(request.getDisplayColor());

        return priority;
    }

    public PriorityResponse toResponse(Priority priority) {

        PriorityResponse response = new PriorityResponse();

        response.setId(priority.getId());
        response.setName(priority.getName());
        response.setDisplayColor(priority.getDisplayColor());
        response.setActive(priority.getActive());

        return response;
    }
}
