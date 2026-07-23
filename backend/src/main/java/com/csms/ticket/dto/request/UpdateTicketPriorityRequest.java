package com.csms.ticket.dto.request;

import com.csms.common.enums.TicketPriority;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTicketPriorityRequest {

    @jakarta.validation.constraints.NotBlank
    private String priority;
}