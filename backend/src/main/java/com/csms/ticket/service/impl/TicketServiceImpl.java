package com.csms.ticket.service.impl;

import com.csms.common.enums.TicketStatus;
import com.csms.calendar.entity.BusinessHours;
import com.csms.calendar.entity.Holiday;
import com.csms.common.response.ApiResponse;
import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import com.csms.issuecategory.entity.IssueCategory;
import com.csms.issuecategory.repository.IssueCategoryRepository;
import com.csms.staff.entity.Staff;
import com.csms.staff.repository.StaffRepository;
import com.csms.ticket.dto.request.CreateTicketRequest;
import com.csms.ticket.dto.response.TicketResponse;
import com.csms.ticket.entity.Ticket;
import com.csms.ticket.mapper.TicketMapper;
import com.csms.ticket.repository.TicketRepository;
import com.csms.ticket.service.TicketService;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.csms.ticket.dto.request.UpdateTicketStatusRequest;
import java.util.List;
import com.csms.ticket.dto.request.AssignStaffRequest;
import com.csms.ticket.dto.request.UpdateTicketPriorityRequest;
import com.csms.history.service.TicketHistoryService;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final IssueCategoryRepository issueCategoryRepository;
    private final StaffRepository staffRepository;
    private final TicketMapper ticketMapper;
    private final TicketHistoryService ticketHistoryService;

    private final com.csms.priority.repository.PriorityRepository priorityRepository;
    private final com.csms.sla.repository.SlaRuleRepository slaRuleRepository;
    private final com.csms.calendar.repository.BusinessHoursRepository businessHoursRepository;
    private final com.csms.calendar.repository.HolidayRepository holidayRepository;
    private final com.csms.asset.repository.AssetRepository assetRepository;
    private final com.csms.subdepartment.repository.SubDepartmentRepository subDepartmentRepository;
    private final com.csms.sla.util.SlaCalculator slaCalculator;
    private final com.csms.audit.service.AuditLogService auditLogService;
    private final com.csms.attachment.repository.AttachmentRepository attachmentRepository;

    private String adjustPriorityForRole(String requestedPriority, String roleName) {
        if (!"FACULTY".equalsIgnoreCase(roleName)) {
            return requestedPriority;
        }
        switch (requestedPriority.toUpperCase()) {
            case "LOW":
                return "MEDIUM";
            case "MEDIUM":
                return "HIGH";
            case "HIGH":
            case "CRITICAL":
                return "CRITICAL";
            default:
                return requestedPriority;
        }
    }

    @Override
    public ApiResponse<TicketResponse> create(CreateTicketRequest request) {

        User user = null;
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();
            user = userRepository.findByEmailWithRole(email).orElse(null);
        }

        if (user == null && request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElse(null);
        }

        if (user == null) {
            user = userRepository.findById(1L)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        com.csms.subdepartment.entity.SubDepartment subDepartment = null;
        if (request.getSubDepartmentId() != null) {
            subDepartment = subDepartmentRepository.findById(request.getSubDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("SubDepartment not found"));
        }

        IssueCategory issueCategory = issueCategoryRepository.findById(request.getIssueCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Issue Category not found"));

        Staff staff = null;

        if (request.getAssignedStaffId() != null) {
            staff = staffRepository.findById(request.getAssignedStaffId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
        } else {
            // Auto-assign to least loaded staff in sub-department or department
            List<Staff> candidates = java.util.Collections.emptyList();
            if (subDepartment != null) {
                candidates = staffRepository.findByDepartmentIdAndSubDepartmentIdAndActiveTrue(department.getId(), subDepartment.getId());
            }
            if (candidates == null || candidates.isEmpty()) {
                candidates = staffRepository.findByDepartmentIdAndActiveTrue(department.getId());
            }

            if (candidates != null && !candidates.isEmpty()) {
                List<TicketStatus> inactiveStatuses = List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED);
                staff = candidates.stream()
                        .min(java.util.Comparator.comparingLong(s ->
                                ticketRepository.countByAssignedStaff_IdAndActiveTrueAndStatusNotIn(s.getId(), inactiveStatuses)
                        ))
                        .orElse(null);
            }
        }

        com.csms.asset.entity.Asset asset = null;
        if (request.getAssetId() != null) {
            asset = assetRepository.findById(request.getAssetId())
                    .orElseThrow(() -> new EntityNotFoundException("Asset not found"));
        }

        // Adjust priority based on user role (Faculty gets higher priority)
        String adjustedPriorityName = adjustPriorityForRole(request.getPriority(), user.getRole().getName());
        com.csms.priority.entity.Priority priority = priorityRepository.findByName(adjustedPriorityName)
                .orElseThrow(() -> new EntityNotFoundException("Priority not found: " + adjustedPriorityName));

        // Find SLA rules with hierarchical lookup: SubDept -> Dept -> Role -> Global Default (ALL)
        com.csms.sla.entity.SlaRule slaRule = null;
        if (subDepartment != null) {
            slaRule = slaRuleRepository.findByDepartmentIdAndSubDepartmentIdAndPriorityNameAndActiveTrue(
                    department.getId(), subDepartment.getId(), priority.getName()
            ).orElse(null);
        }
        if (slaRule == null) {
            slaRule = slaRuleRepository.findByDepartmentIdAndPriorityNameAndActiveTrue(
                    department.getId(), priority.getName()
            ).orElse(null);
        }
        if (slaRule == null) {
            slaRule = slaRuleRepository.findByPriorityNameAndUserRoleAndActiveTrue(
                    priority.getName(), user.getRole().getName()
            ).orElse(null);
        }
        if (slaRule == null) {
            slaRule = slaRuleRepository.findByPriorityNameAndUserRoleAndActiveTrue(
                    priority.getName(), "ALL"
            ).orElse(null);
        }

        int responseMins = 1440; // Default 1 day
        int resolutionMins = 4320; // Default 3 days

        if (slaRule != null) {
            responseMins = slaRule.getResponseTimeLimitMinutes();
            resolutionMins = slaRule.getResolutionTimeLimitMinutes();
        }

        List<BusinessHours> bizHours = businessHoursRepository.findByActiveTrue();
        List<Holiday> holidays = holidayRepository.findByActiveTrue();

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime slaResponseDeadline = slaCalculator.calculateDeadline(now, responseMins, bizHours, holidays);
        java.time.LocalDateTime slaResolutionDeadline = slaCalculator.calculateDeadline(now, resolutionMins, bizHours, holidays);

        Ticket ticket = ticketMapper.toEntity(request);

        if (staff != null) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        } else {
            ticket.setStatus(TicketStatus.CREATED);
        }
        ticket.setUser(user);
        ticket.setDepartment(department);
        ticket.setSubDepartment(subDepartment);
        ticket.setIssueCategory(issueCategory);
        ticket.setAssignedStaff(staff);
        ticket.setAsset(asset);
        ticket.setPriority(priority);
        ticket.setSlaResponseDeadline(slaResponseDeadline);
        ticket.setSlaResolutionDeadline(slaResolutionDeadline);

        ticket = ticketRepository.save(ticket);
        String historyLogMsg = (request.getAssignedStaffId() != null)
                ? "Ticket created and explicitly assigned to staff: " + staff.getName()
                : (staff != null)
                ? "Ticket created and auto-assigned to least-loaded staff: " + staff.getName()
                : "Ticket created";
        ticketHistoryService.createHistory(
                ticket,
                historyLogMsg
        );

        return ApiResponse.success(
                "Ticket created successfully",
                ticketMapper.toResponse(ticket)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<TicketResponse>> getAll() {

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ApiResponse.success("No tickets found", java.util.Collections.emptyList());
        }

        String email = auth.getName();
        User currentUser = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        String role = currentUser.getRole().getName();
        List<Ticket> ticketList;

        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            ticketList = ticketRepository.findByActiveTrue();
        } else if ("DEPARTMENT_ADMIN".equalsIgnoreCase(role)) {
            if (currentUser.getDepartment() != null) {
                ticketList = ticketRepository.findByDepartmentIdAndActiveTrue(currentUser.getDepartment().getId());
            } else {
                ticketList = java.util.Collections.emptyList();
            }
        } else if ("STAFF".equalsIgnoreCase(role)) {
            ticketList = ticketRepository.findByAssignedStaff_User_EmailAndActiveTrue(email);
        } else {
            // FACULTY or STUDENT
            ticketList = ticketRepository.findByUser_EmailAndActiveTrue(email);
        }

        List<TicketResponse> tickets = ticketList.stream()
                .map(ticketMapper::toResponse)
                .toList();

        return ApiResponse.success("Tickets fetched successfully", tickets);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<TicketResponse> getById(Long id) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String email = auth.getName();
            User currentUser = userRepository.findByEmailWithRole(email)
                    .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
            String role = currentUser.getRole().getName();

            if (!"SUPER_ADMIN".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
                if ("DEPARTMENT_ADMIN".equalsIgnoreCase(role)) {
                    if (currentUser.getDepartment() == null || !currentUser.getDepartment().getId().equals(ticket.getDepartment().getId())) {
                        throw new org.springframework.security.access.AccessDeniedException("Access denied to this ticket");
                    }
                } else if ("STAFF".equalsIgnoreCase(role)) {
                    if (ticket.getAssignedStaff() == null || !ticket.getAssignedStaff().getUser().getEmail().equalsIgnoreCase(email)) {
                        throw new org.springframework.security.access.AccessDeniedException("Access denied to this ticket");
                    }
                } else {
                    // FACULTY or STUDENT
                    if (!ticket.getUser().getEmail().equalsIgnoreCase(email)) {
                        throw new org.springframework.security.access.AccessDeniedException("Access denied to this ticket");
                    }
                }
            }
        }

        return ApiResponse.success(
                "Ticket fetched successfully",
                ticketMapper.toResponse(ticket)
        );
    }

    @Override
    public ApiResponse<TicketResponse> update(Long id, CreateTicketRequest request) {

        throw new UnsupportedOperationException("Update will be implemented later");
    }


    private boolean isValidTransition(TicketStatus currentStatus, TicketStatus newStatus) {
        if (currentStatus == newStatus) return true;
        switch (currentStatus) {
            case CREATED:
                return newStatus == TicketStatus.ASSIGNED || newStatus == TicketStatus.CLOSED;
            case ASSIGNED:
                return newStatus == TicketStatus.ACCEPTED || newStatus == TicketStatus.ASSIGNED || newStatus == TicketStatus.CREATED || newStatus == TicketStatus.CLOSED;
            case ACCEPTED:
                return newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.PENDING_USER || newStatus == TicketStatus.CLOSED;
            case IN_PROGRESS:
                return newStatus == TicketStatus.PENDING_USER || newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED;
            case PENDING_USER:
                return newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED;
            case RESOLVED:
                return newStatus == TicketStatus.CLOSED || newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.REOPENED;
            case CLOSED:
                return newStatus == TicketStatus.CREATED || newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.REOPENED;
            case REOPENED:
                return newStatus == TicketStatus.ASSIGNED || newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED;
            default:
                return false;
        }
    }

    @Override
    public ApiResponse<TicketResponse> updateStatus(
            Long ticketId,
            UpdateTicketStatusRequest request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Ticket not found"));

        if (!isValidTransition(ticket.getStatus(), request.getStatus())) {
            throw new IllegalArgumentException("Invalid status transition from " + ticket.getStatus() + " to " + request.getStatus());
        }

        // Compulsory proof photo enforcement: Staff must upload a photo attachment of completed/repaired work before resolving or closing tickets
        if (request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                String currentEmail = auth.getName();
                User currentUser = userRepository.findByEmailWithRole(currentEmail).orElse(null);
                if (currentUser != null && "STAFF".equalsIgnoreCase(currentUser.getRole().getName())) {
                    List<com.csms.attachment.entity.Attachment> attachments = attachmentRepository.findByTicketIdAndActiveTrue(ticketId);
                    if (attachments == null || attachments.isEmpty()) {
                        throw new IllegalArgumentException("Compulsory Work Proof Required: Staff must upload a photo of the completed or repaired work in Attachments before resolving or closing the ticket.");
                    }
                }
            }
        }

        String oldStatus = ticket.getStatus().name();

        // SLA response tracking
        if ((request.getStatus() == TicketStatus.ACCEPTED || request.getStatus() == TicketStatus.IN_PROGRESS) && ticket.getRespondedAt() == null) {
            ticket.setRespondedAt(java.time.LocalDateTime.now());
        }

        // SLA resolution tracking
        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        } else if (request.getStatus() == TicketStatus.IN_PROGRESS && ticket.getStatus() == TicketStatus.RESOLVED) {
            // Reopened
            ticket.setResolvedAt(null);
        }

        ticket.setStatus(request.getStatus());
        ticketHistoryService.createHistory(
                ticket,
                "Status changed to " + request.getStatus()
        );

        ticketRepository.save(ticket);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth != null ? auth.getName() : "system@csms.com";
        auditLogService.logEvent(currentEmail, "Changed status", "Ticket", ticket.getId(), oldStatus, request.getStatus().name());

        return ApiResponse.success(
                "Ticket status updated successfully",
                ticketMapper.toResponse(ticket)
        );
    }

    @Override
    public ApiResponse<TicketResponse> assignStaff(
            Long ticketId,
            AssignStaffRequest request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Ticket not found"));

        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Staff not found"));

        String oldStaff = ticket.getAssignedStaff() != null ? ticket.getAssignedStaff().getName() : "Unassigned";

        ticket.setAssignedStaff(staff);
        if (ticket.getStatus() == TicketStatus.CREATED) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }
        ticketHistoryService.createHistory(
                ticket,
                "Assigned to staff member: " + staff.getName()
        );

        ticketRepository.save(ticket);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth != null ? auth.getName() : "system@csms.com";
        auditLogService.logEvent(currentEmail, "Assigned staff", "Ticket", ticket.getId(), oldStaff, staff.getName());

        return ApiResponse.success(
                "Staff assigned successfully",
                ticketMapper.toResponse(ticket)
        );
    }

    @Override
    public ApiResponse<TicketResponse> updatePriority(
            Long ticketId,
            UpdateTicketPriorityRequest request) {

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String email = auth.getName();
            User currentUser = userRepository.findByEmailWithRole(email).orElse(null);
            if (currentUser != null && "STAFF".equalsIgnoreCase(currentUser.getRole().getName())) {
                throw new org.springframework.security.access.AccessDeniedException("Staff members are not allowed to change ticket priority");
            }
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Ticket not found"));

        com.csms.priority.entity.Priority priority = priorityRepository.findByName(request.getPriority())
                .orElseThrow(() -> new EntityNotFoundException("Priority not found: " + request.getPriority()));

        String oldPriority = ticket.getPriority() != null ? ticket.getPriority().getName() : "None";

        ticket.setPriority(priority);
        ticketHistoryService.createHistory(
                ticket,
                "Priority changed to " + request.getPriority()
        );

        ticketRepository.save(ticket);

        String currentEmail = auth != null ? auth.getName() : "system@csms.com";
        auditLogService.logEvent(currentEmail, "Changed priority", "Ticket", ticket.getId(), oldPriority, request.getPriority());

        return ApiResponse.success(
                "Ticket priority updated successfully",
                ticketMapper.toResponse(ticket)
        );
    }

    @Override
    @Transactional
    public ApiResponse<String> delete(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));

        ticket.setActive(false);
        ticketRepository.save(ticket);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth != null ? auth.getName() : "system@csms.com";
        auditLogService.logEvent(currentEmail, "Deleted ticket", "Ticket", ticket.getId(), "ACTIVE", "DELETED");

        return ApiResponse.success("Ticket deleted successfully", "Ticket #" + id + " has been deleted.");
    }

    @Override
    @Transactional
    public ApiResponse<String> clearAll() {
        List<Ticket> activeTickets = ticketRepository.findByActiveTrue();
        for (Ticket ticket : activeTickets) {
            ticket.setActive(false);
        }
        ticketRepository.saveAll(activeTickets);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth != null ? auth.getName() : "system@csms.com";
        auditLogService.logEvent(currentEmail, "Cleared all tickets", "Ticket", 0L, activeTickets.size() + " active tickets", "0 active tickets");

        return ApiResponse.success("All tickets cleared successfully", activeTickets.size() + " tickets cleared.");
    }
}