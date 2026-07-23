package com.csms.history.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketHistoryResponse {

    private Long id;

    private Long ticketId;

    private String action;

    private LocalDateTime createdAt;
}