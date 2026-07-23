package com.csms.escalation.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.escalation.dto.request.CreateEscalationRuleRequest;
import com.csms.escalation.dto.response.EscalationHistoryResponse;
import com.csms.escalation.dto.response.EscalationRuleResponse;
import com.csms.escalation.entity.EscalationRule;
import com.csms.escalation.mapper.EscalationMapper;
import com.csms.escalation.repository.EscalationHistoryRepository;
import com.csms.escalation.repository.EscalationRuleRepository;
import com.csms.escalation.service.EscalationService;
import com.csms.sla.entity.SlaRule;
import com.csms.sla.repository.SlaRuleRepository;
import com.csms.ticket.repository.TicketRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Escalation rules are global configuration, owned exclusively by Super
 * Admin (per business vision: "Super Admin is the ONLY person who can
 * modify ... Escalation rules"). The SLA engine (SlaEngineServiceImpl)
 * consumes these rules automatically; this service exposes CRUD over
 * them plus a read-only escalation timeline per ticket.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EscalationServiceImpl implements EscalationService {

    private final EscalationRuleRepository escalationRuleRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final SlaRuleRepository slaRuleRepository;
    private final TicketRepository ticketRepository;
    private final EscalationMapper escalationMapper;

    @Override
    public ApiResponse<EscalationRuleResponse> createRule(CreateEscalationRuleRequest request) {

        SlaRule slaRule = slaRuleRepository.findById(request.getSlaRuleId())
                .orElseThrow(() -> new EntityNotFoundException("SLA rule not found"));

        EscalationRule rule = new EscalationRule();
        rule.setSlaRule(slaRule);
        rule.setTriggerAfterMinutes(request.getTriggerAfterMinutes());
        rule.setEscalationLevel(request.getEscalationLevel());
        rule.setNotifyRole(request.getNotifyRole().toUpperCase());

        rule = escalationRuleRepository.save(rule);

        return ApiResponse.success("Escalation rule created successfully", escalationMapper.toResponse(rule));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EscalationRuleResponse>> getAllRules() {

        List<EscalationRuleResponse> rules = escalationRuleRepository.findByActiveTrueOrderBySlaRuleIdAscEscalationLevelAsc()
                .stream()
                .map(escalationMapper::toResponse)
                .toList();

        return ApiResponse.success("Escalation rules fetched successfully", rules);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EscalationRuleResponse> getRuleById(Long id) {

        EscalationRule rule = escalationRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Escalation rule not found"));

        return ApiResponse.success("Escalation rule fetched successfully", escalationMapper.toResponse(rule));
    }

    @Override
    public ApiResponse<EscalationRuleResponse> updateRule(Long id, CreateEscalationRuleRequest request) {

        EscalationRule rule = escalationRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Escalation rule not found"));

        SlaRule slaRule = slaRuleRepository.findById(request.getSlaRuleId())
                .orElseThrow(() -> new EntityNotFoundException("SLA rule not found"));

        rule.setSlaRule(slaRule);
        rule.setTriggerAfterMinutes(request.getTriggerAfterMinutes());
        rule.setEscalationLevel(request.getEscalationLevel());
        rule.setNotifyRole(request.getNotifyRole().toUpperCase());

        rule = escalationRuleRepository.save(rule);

        return ApiResponse.success("Escalation rule updated successfully", escalationMapper.toResponse(rule));
    }

    @Override
    public ApiResponse<String> deleteRule(Long id) {

        EscalationRule rule = escalationRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Escalation rule not found"));

        rule.setActive(false);
        escalationRuleRepository.save(rule);

        return ApiResponse.success("Escalation rule deleted successfully", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EscalationHistoryResponse>> getHistoryForTicket(Long ticketId) {

        if (!ticketRepository.existsById(ticketId)) {
            throw new EntityNotFoundException("Ticket not found");
        }

        List<EscalationHistoryResponse> history = escalationHistoryRepository.findByTicketIdOrderByEscalationLevelAsc(ticketId)
                .stream()
                .map(escalationMapper::toResponse)
                .toList();

        return ApiResponse.success("Escalation history fetched successfully", history);
    }
}
