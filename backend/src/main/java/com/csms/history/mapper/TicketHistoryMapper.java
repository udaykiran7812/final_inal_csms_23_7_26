package com.csms.history.mapper;

import com.csms.history.dto.response.TicketHistoryResponse;
import com.csms.history.entity.TicketHistory;
import org.springframework.stereotype.Component;

@Component
public class TicketHistoryMapper {

    public TicketHistoryResponse toResponse(TicketHistory history) {

        TicketHistoryResponse response = new TicketHistoryResponse();

        response.setId(history.getId());
        response.setTicketId(history.getTicket().getId());
        response.setAction(history.getAction());
        response.setCreatedAt(history.getCreatedAt());

        return response;
    }
}