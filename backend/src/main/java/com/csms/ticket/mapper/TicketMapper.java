package com.csms.ticket.mapper;

import com.csms.ticket.dto.request.CreateTicketRequest;
import com.csms.ticket.dto.response.TicketResponse;
import com.csms.ticket.entity.Ticket;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public Ticket toEntity(CreateTicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        return ticket;
    }

    public TicketResponse toResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();

        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus());

        if (ticket.getPriority() != null) {
            response.setPriority(ticket.getPriority().getName());
        }

        if (ticket.getUser() != null) {
            response.setUserName(
                    ticket.getUser().getFirstName() + " " + (ticket.getUser().getLastName() != null ? ticket.getUser().getLastName() : "")
            );
        }

        if (ticket.getDepartment() != null) {
            response.setDepartmentId(ticket.getDepartment().getId());
            response.setDepartmentName(ticket.getDepartment().getName());
        }

        if (ticket.getSubDepartment() != null) {
            response.setSubDepartmentId(ticket.getSubDepartment().getId());
            response.setSubDepartmentName(ticket.getSubDepartment().getName());
        }

        if (ticket.getIssueCategory() != null) {
            response.setIssueCategoryName(ticket.getIssueCategory().getName());
        }

        if (ticket.getAssignedStaff() != null) {
            response.setAssignedStaffName(ticket.getAssignedStaff().getName());
        }

        if (ticket.getAsset() != null) {
            response.setAssetId(ticket.getAsset().getId());
            response.setAssetName(ticket.getAsset().getName());
        }

        response.setSlaResponseDeadline(ticket.getSlaResponseDeadline());
        response.setSlaResolutionDeadline(ticket.getSlaResolutionDeadline());
        response.setRespondedAt(ticket.getRespondedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setSlaBreached(ticket.getSlaBreached());

        return response;
    }
}