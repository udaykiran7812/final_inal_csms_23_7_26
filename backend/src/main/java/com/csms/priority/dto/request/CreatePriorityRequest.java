package com.csms.priority.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePriorityRequest {

    @NotBlank(message = "Priority name is required")
    private String name;

    private String displayColor;
}
