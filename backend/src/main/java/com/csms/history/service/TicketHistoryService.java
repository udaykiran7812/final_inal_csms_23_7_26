package com.csms.history.service;

import com.csms.common.response.ApiResponse;
import com.csms.history.dto.response.TicketHistoryResponse;
import com.csms.ticket.entity.Ticket;

import java.util.List;

public interface TicketHistoryService {

    void createHistory(
            Ticket ticket,
            String action
    );

    ApiResponse<List<TicketHistoryResponse>> getByTicketId(
            Long ticketId
    );
}