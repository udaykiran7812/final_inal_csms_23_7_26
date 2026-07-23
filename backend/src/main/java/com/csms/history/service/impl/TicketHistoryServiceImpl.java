package com.csms.history.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.history.dto.response.TicketHistoryResponse;
import com.csms.history.entity.TicketHistory;
import com.csms.history.mapper.TicketHistoryMapper;
import com.csms.history.repository.TicketHistoryRepository;
import com.csms.history.service.TicketHistoryService;
import com.csms.ticket.entity.Ticket;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketHistoryServiceImpl implements TicketHistoryService {

    private final TicketHistoryRepository ticketHistoryRepository;

    private final TicketHistoryMapper ticketHistoryMapper;


    @Override
    public void createHistory(
            Ticket ticket,
            String action
    ) {

        TicketHistory history = new TicketHistory();

        history.setTicket(ticket);
        history.setAction(action);

        ticketHistoryRepository.save(history);
    }


    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<TicketHistoryResponse>> getByTicketId(
            Long ticketId
    ) {

        List<TicketHistoryResponse> historyList =
                ticketHistoryRepository
                        .findByTicketIdOrderByCreatedAtDesc(ticketId)
                        .stream()
                        .map(ticketHistoryMapper::toResponse)
                        .toList();


        return ApiResponse.success(
                "Ticket history fetched successfully",
                historyList
        );
    }
}