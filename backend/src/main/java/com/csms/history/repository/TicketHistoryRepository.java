package com.csms.history.repository;

import com.csms.history.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {

    List<TicketHistory> findByTicketIdOrderByCreatedAtDesc(Long ticketId);

}