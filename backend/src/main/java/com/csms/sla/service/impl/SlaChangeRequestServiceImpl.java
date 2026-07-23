package com.csms.sla.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.priority.entity.Priority;
import com.csms.priority.repository.PriorityRepository;
import com.csms.sla.dto.request.CreateSlaChangeRequest;
import com.csms.sla.dto.response.SlaChangeRequestResponse;
import com.csms.sla.entity.SlaChangeRequest;
import com.csms.sla.entity.SlaRule;
import com.csms.sla.repository.SlaChangeRequestRepository;
import com.csms.sla.repository.SlaRuleRepository;
import com.csms.sla.service.SlaChangeRequestService;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SlaChangeRequestServiceImpl implements SlaChangeRequestService {

    private final SlaChangeRequestRepository slaChangeRequestRepository;
    private final SlaRuleRepository slaRuleRepository;
    private final PriorityRepository priorityRepository;
    private final UserRepository userRepository;

    @Override
    public ApiResponse<SlaChangeRequestResponse> submitRequest(CreateSlaChangeRequest request, String userEmail) {
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userEmail));

        SlaChangeRequest entity = new SlaChangeRequest();
        entity.setRequester(requester);
        entity.setPriorityName(request.getPriorityName());
        entity.setUserRole(request.getUserRole());
        entity.setProposedResponseTimeLimitMinutes(request.getProposedResponseTimeLimitMinutes());
        entity.setProposedResolutionTimeLimitMinutes(request.getProposedResolutionTimeLimitMinutes());
        entity.setJustification(request.getJustification());
        entity.setStatus(SlaChangeRequest.Status.PENDING);

        entity = slaChangeRequestRepository.save(entity);

        return ApiResponse.success("SLA Change Request submitted to Super Admin successfully", mapToDto(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<SlaChangeRequestResponse>> getAllRequests() {
        List<SlaChangeRequestResponse> list = slaChangeRequestRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .toList();
        return ApiResponse.success("SLA Change Requests fetched successfully", list);
    }

    @Override
    public ApiResponse<SlaChangeRequestResponse> approveRequest(Long requestId, String adminNotes) {
        SlaChangeRequest changeReq = slaChangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("SLA Change Request not found: " + requestId));

        if (changeReq.getStatus() != SlaChangeRequest.Status.PENDING) {
            throw new IllegalStateException("Request is already " + changeReq.getStatus());
        }

        changeReq.setStatus(SlaChangeRequest.Status.APPROVED);
        changeReq.setAdminNotes(adminNotes);

        // Apply SLA Rule changes
        String pName = changeReq.getPriorityName();
        Priority priority = priorityRepository.findByName(pName)
                .orElseThrow(() -> new EntityNotFoundException("Priority not found: " + pName));

        SlaRule rule = slaRuleRepository.findByPriorityNameAndUserRoleAndActiveTrue(changeReq.getPriorityName(), changeReq.getUserRole())
                .orElse(null);

        if (rule == null) {
            rule = new SlaRule();
            rule.setPriority(priority);
            rule.setUserRole(changeReq.getUserRole());
            rule.setActive(true);
        }

        rule.setResponseTimeLimitMinutes(changeReq.getProposedResponseTimeLimitMinutes());
        rule.setResolutionTimeLimitMinutes(changeReq.getProposedResolutionTimeLimitMinutes());

        slaRuleRepository.save(rule);
        changeReq = slaChangeRequestRepository.save(changeReq);

        return ApiResponse.success("SLA Change Request approved and SLA Rule updated", mapToDto(changeReq));
    }

    @Override
    public ApiResponse<SlaChangeRequestResponse> rejectRequest(Long requestId, String adminNotes) {
        SlaChangeRequest changeReq = slaChangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("SLA Change Request not found: " + requestId));

        if (changeReq.getStatus() != SlaChangeRequest.Status.PENDING) {
            throw new IllegalStateException("Request is already " + changeReq.getStatus());
        }

        changeReq.setStatus(SlaChangeRequest.Status.REJECTED);
        changeReq.setAdminNotes(adminNotes);
        changeReq = slaChangeRequestRepository.save(changeReq);

        return ApiResponse.success("SLA Change Request rejected", mapToDto(changeReq));
    }

    private SlaChangeRequestResponse mapToDto(SlaChangeRequest req) {
        SlaChangeRequestResponse dto = new SlaChangeRequestResponse();
        dto.setId(req.getId());
        dto.setRequesterId(req.getRequester().getId());
        dto.setRequesterName(req.getRequester().getFirstName() + " " + (req.getRequester().getLastName() != null ? req.getRequester().getLastName() : ""));
        dto.setRequesterEmail(req.getRequester().getEmail());
        dto.setPriorityName(req.getPriorityName());
        dto.setUserRole(req.getUserRole());
        dto.setProposedResponseTimeLimitMinutes(req.getProposedResponseTimeLimitMinutes());
        dto.setProposedResolutionTimeLimitMinutes(req.getProposedResolutionTimeLimitMinutes());
        dto.setJustification(req.getJustification());
        dto.setStatus(req.getStatus().name());
        dto.setAdminNotes(req.getAdminNotes());
        dto.setCreatedAt(req.getCreatedAt());
        return dto;
    }
}
