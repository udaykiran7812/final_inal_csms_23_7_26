package com.csms.ticket.service;

import com.csms.common.response.ApiResponse;
import com.csms.ticket.dto.request.CreateTicketRequest;
import com.csms.ticket.dto.response.TicketResponse;
import com.csms.ticket.dto.request.UpdateTicketStatusRequest;
import java.util.List;
import com.csms.ticket.dto.request.AssignStaffRequest;
import com.csms.ticket.dto.request.UpdateTicketPriorityRequest;

public interface TicketService {

    ApiResponse<TicketResponse> create(CreateTicketRequest request);

    ApiResponse<List<TicketResponse>> getAll();

    ApiResponse<TicketResponse> getById(Long id);

    ApiResponse<TicketResponse> update(Long id, CreateTicketRequest request);

    ApiResponse<String> delete(Long id);

    ApiResponse<String> clearAll();

    ApiResponse<TicketResponse> updateStatus(
            Long ticketId,
            UpdateTicketStatusRequest request
    );

    ApiResponse<TicketResponse> assignStaff(
            Long ticketId,
            AssignStaffRequest request
    );

    ApiResponse<TicketResponse> updatePriority(
            Long ticketId,
            UpdateTicketPriorityRequest request
    );
}