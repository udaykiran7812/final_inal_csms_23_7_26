package com.csms.escalation.repository;

import com.csms.escalation.entity.EscalationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EscalationHistoryRepository extends JpaRepository<EscalationHistory, Long> {

    List<EscalationHistory> findByTicketId(Long ticketId);

    List<EscalationHistory> findByTicketIdOrderByEscalationLevelAsc(Long ticketId);
}
