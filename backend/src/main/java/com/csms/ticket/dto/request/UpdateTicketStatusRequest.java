package com.csms.ticket.dto.request;

import com.csms.common.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTicketStatusRequest {

    @NotNull
    private TicketStatus status;
}