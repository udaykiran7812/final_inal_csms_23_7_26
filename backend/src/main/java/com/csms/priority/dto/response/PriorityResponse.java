package com.csms.priority.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PriorityResponse {

    private Long id;
    private String name;
    private String displayColor;
    private boolean active;
}
