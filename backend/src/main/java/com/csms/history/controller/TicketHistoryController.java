package com.csms.history.controller;

import com.csms.common.response.ApiResponse;
import com.csms.history.dto.response.TicketHistoryResponse;
import com.csms.history.service.TicketHistoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketHistoryController {

    private final TicketHistoryService ticketHistoryService;


    @GetMapping("/{ticketId}/history")
    public ApiResponse<List<TicketHistoryResponse>> getHistory(
            @PathVariable Long ticketId
    ) {

        return ticketHistoryService.getByTicketId(ticketId);
    }
}