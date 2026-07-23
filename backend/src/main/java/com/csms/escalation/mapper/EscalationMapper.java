package com.csms.escalation.mapper;

import com.csms.escalation.dto.response.EscalationHistoryResponse;
import com.csms.escalation.dto.response.EscalationRuleResponse;
import com.csms.escalation.entity.EscalationHistory;
import com.csms.escalation.entity.EscalationRule;
import org.springframework.stereotype.Component;

@Component
public class EscalationMapper {

    public EscalationRuleResponse toResponse(EscalationRule rule) {

        EscalationRuleResponse response = new EscalationRuleResponse();

        response.setId(rule.getId());
        response.setSlaRuleId(rule.getSlaRule().getId());
        response.setPriorityName(
                rule.getSlaRule().getPriority() != null ? rule.getSlaRule().getPriority().getName() : null
        );
        response.setSlaUserRole(rule.getSlaRule().getUserRole());
        response.setTriggerAfterMinutes(rule.getTriggerAfterMinutes());
        response.setEscalationLevel(rule.getEscalationLevel());
        response.setNotifyRole(rule.getNotifyRole());
        response.setActive(rule.getActive());

        return response;
    }

    public EscalationHistoryResponse toResponse(EscalationHistory history) {

        EscalationHistoryResponse response = new EscalationHistoryResponse();

        response.setId(history.getId());
        response.setTicketId(history.getTicket().getId());
        response.setEscalationLevel(history.getEscalationLevel());
        response.setNotifiedUserId(history.getNotifiedUser().getId());
        response.setNotifiedUserName(
                history.getNotifiedUser().getFirstName() + " " +
                        (history.getNotifiedUser().getLastName() != null ? history.getNotifiedUser().getLastName() : "")
        );
        response.setTriggeredAt(history.getTriggeredAt());

        return response;
    }
}
