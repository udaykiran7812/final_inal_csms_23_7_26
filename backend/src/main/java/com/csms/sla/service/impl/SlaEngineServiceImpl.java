package com.csms.sla.service.impl;

import com.csms.common.enums.TicketStatus;
import com.csms.escalation.entity.EscalationHistory;
import com.csms.escalation.entity.EscalationRule;
import com.csms.escalation.repository.EscalationHistoryRepository;
import com.csms.escalation.repository.EscalationRuleRepository;
import com.csms.history.service.TicketHistoryService;
import com.csms.notification.service.NotificationService;
import com.csms.sla.entity.SlaRule;
import com.csms.sla.repository.SlaRuleRepository;
import com.csms.sla.service.SlaEngineService;
import com.csms.ticket.entity.Ticket;
import com.csms.ticket.repository.TicketRepository;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SlaEngineServiceImpl implements SlaEngineService {

    private final TicketRepository ticketRepository;
    private final SlaRuleRepository slaRuleRepository;
    private final EscalationRuleRepository escalationRuleRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final NotificationService notificationService;
    private final TicketHistoryService ticketHistoryService;
    private final UserRepository userRepository;

    @Override
    @Scheduled(fixedRate = 60000) // Runs every 1 minute
    public void checkActiveTicketsSla() {
        log.debug("Starting SLA Breach Check Scheduler...");
        List<Ticket> activeTickets = ticketRepository.findByActiveTrueAndStatusNotIn(
                List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED)
        );

        LocalDateTime now = LocalDateTime.now();

        for (Ticket ticket : activeTickets) {
            try {
                processTicketSla(ticket, now);
            } catch (Exception e) {
                log.error("Error processing SLA for Ticket ID {}: {}", ticket.getId(), e.getMessage());
            }
        }
    }

    private void processTicketSla(Ticket ticket, LocalDateTime now) {
        if (ticket.getPriority() == null || ticket.getUser() == null || ticket.getUser().getRole() == null) {
            return;
        }

        String priorityName = ticket.getPriority().getName();
        String userRole = ticket.getUser().getRole().getName();

        SlaRule rule = slaRuleRepository.findByPriorityNameAndUserRoleAndActiveTrue(priorityName, userRole)
                .orElse(null);

        if (rule == null) {
            return;
        }

        boolean breached = false;
        LocalDateTime breachDeadline = null;
        String breachType = "";

        // 1. Check Response SLA
        if (ticket.getRespondedAt() == null && ticket.getSlaResponseDeadline() != null && now.isAfter(ticket.getSlaResponseDeadline())) {
            breached = true;
            breachDeadline = ticket.getSlaResponseDeadline();
            breachType = "Response SLA";
        }
        // 2. Check Resolution SLA (only check if Response SLA didn't just breach to avoid double triggering in one loop)
        else if (ticket.getResolvedAt() == null && ticket.getSlaResolutionDeadline() != null && now.isAfter(ticket.getSlaResolutionDeadline())) {
            breached = true;
            breachDeadline = ticket.getSlaResolutionDeadline();
            breachType = "Resolution SLA";
        }

        if (breached) {
            // Flag breach on ticket
            if (!ticket.getSlaBreached()) {
                ticket.setSlaBreached(true);
                ticketRepository.save(ticket);
                ticketHistoryService.createHistory(ticket, "SLA breach detected on: " + breachType);
                log.info("Ticket ID {} has breached its {}", ticket.getId(), breachType);
            }

            // Check and trigger escalations
            long minutesOverdue = Duration.between(breachDeadline, now).toMinutes();
            triggerEscalations(ticket, rule, minutesOverdue, now);
        }
    }

    private void triggerEscalations(Ticket ticket, SlaRule rule, long minutesOverdue, LocalDateTime now) {
        List<EscalationRule> escalations = escalationRuleRepository.findBySlaRuleIdAndActiveTrueOrderByEscalationLevelAsc(rule.getId());
        List<EscalationHistory> history = escalationHistoryRepository.findByTicketId(ticket.getId());

        for (EscalationRule er : escalations) {
            if (minutesOverdue >= er.getTriggerAfterMinutes()) {
                // Check if this level was already triggered
                boolean alreadyTriggered = history.stream()
                        .anyMatch(h -> h.getEscalationLevel().equals(er.getEscalationLevel()));

                if (!alreadyTriggered) {
                    triggerEscalationEvent(ticket, er, now);
                }
            }
        }
    }

    private void triggerEscalationEvent(Ticket ticket, EscalationRule er, LocalDateTime now) {
        log.info("Triggering Escalation Level {} for Ticket ID {}", er.getEscalationLevel(), ticket.getId());

        // Send notifications based on notify role
        String title = "Escalation Alert: Ticket #" + ticket.getId() + " SLA Breached";
        String message = "Ticket #" + ticket.getId() + " ('" + ticket.getTitle() + "') has breached its SLA. Escalation Level: " + er.getEscalationLevel();

        Long deptId = ticket.getDepartment() != null ? ticket.getDepartment().getId() : null;
        notificationService.sendNotificationToRole(er.getNotifyRole(), deptId, title, message);

        // Resolve a representative recipient directly via the user repository
        // (department-scoped for DEPARTMENT_ADMIN, global otherwise), to
        // satisfy the escalation_history.notified_user_id FK.
        User notifiedUser = resolveRecipient(er.getNotifyRole(), deptId);

        if (notifiedUser == null) {
            log.warn("No user found to satisfy escalation history recipient for role {} (ticket {}); skipping history record",
                    er.getNotifyRole(), ticket.getId());
            return;
        }

        EscalationHistory eh = new EscalationHistory();
        eh.setTicket(ticket);
        eh.setEscalationLevel(er.getEscalationLevel());
        eh.setTriggeredAt(now);
        eh.setNotifiedUser(notifiedUser);
        escalationHistoryRepository.save(eh);

        ticketHistoryService.createHistory(ticket, "Ticket escalated to Level " + er.getEscalationLevel() + " (" + er.getNotifyRole() + ")");
    }

    private User resolveRecipient(String notifyRole, Long departmentId) {
        List<User> candidates;

        if ("DEPARTMENT_ADMIN".equalsIgnoreCase(notifyRole) && departmentId != null) {
            candidates = userRepository.findByRole_NameAndDepartmentIdAndActiveTrue(notifyRole, departmentId);
        } else {
            candidates = userRepository.findByRole_NameAndActiveTrue(notifyRole);
        }

        if (!candidates.isEmpty()) {
            return candidates.get(0);
        }

        // Fallback: SUPER_ADMIN is the ultimate escalation point and should
        // always exist, so use it if the configured notify role has nobody
        // assigned yet (e.g. a department with no admin set up).
        List<User> superAdmins = userRepository.findByRole_NameAndActiveTrue("SUPER_ADMIN");
        return superAdmins.isEmpty() ? null : superAdmins.get(0);
    }
}
