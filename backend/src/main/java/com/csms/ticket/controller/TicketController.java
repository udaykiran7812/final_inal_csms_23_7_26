package com.csms.ticket.controller;

import com.csms.common.response.ApiResponse;
import com.csms.ticket.dto.request.CreateTicketRequest;
import com.csms.ticket.dto.response.TicketResponse;
import com.csms.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.csms.ticket.dto.request.UpdateTicketStatusRequest;
import com.csms.ticket.dto.request.UpdateTicketPriorityRequest;

import java.util.List;
import com.csms.ticket.dto.request.AssignStaffRequest;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<TicketResponse> create(@Valid @RequestBody CreateTicketRequest request) {
        return ticketService.create(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<TicketResponse>> getAll() {
        return ticketService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<TicketResponse> getById(@PathVariable Long id) {
        return ticketService.getById(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<TicketResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {

        return ticketService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','DEPARTMENT_ADMIN')")
    public ApiResponse<TicketResponse> assignStaff(
            @PathVariable Long id,
            @Valid @RequestBody AssignStaffRequest request) {

        return ticketService.assignStaff(id, request);
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','DEPARTMENT_ADMIN')")
    public ApiResponse<TicketResponse> updatePriority(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketPriorityRequest request) {

        return ticketService.updatePriority(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        return ticketService.delete(id);
    }

    @DeleteMapping("/clear-all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> clearAll() {
        return ticketService.clearAll();
    }
}