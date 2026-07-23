package com.csms.ticket.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.common.enums.TicketStatus;
import com.csms.department.entity.Department;
import com.csms.issuecategory.entity.IssueCategory;
import com.csms.priority.entity.Priority;
import com.csms.staff.entity.Staff;
import com.csms.subdepartment.entity.SubDepartment;
import com.csms.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
public class Ticket extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "priority_id")
    private Priority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_department_id")
    private SubDepartment subDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_category_id")
    private IssueCategory issueCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private Staff assignedStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private com.csms.asset.entity.Asset asset;

    @Column(name = "sla_response_deadline")
    private java.time.LocalDateTime slaResponseDeadline;

    @Column(name = "sla_resolution_deadline")
    private java.time.LocalDateTime slaResolutionDeadline;

    @Column(name = "responded_at")
    private java.time.LocalDateTime respondedAt;

    @Column(name = "resolved_at")
    private java.time.LocalDateTime resolvedAt;

    @Column(name = "sla_breached", nullable = false)
    private Boolean slaBreached = false;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public SubDepartment getSubDepartment() { return subDepartment; }
    public void setSubDepartment(SubDepartment subDepartment) { this.subDepartment = subDepartment; }

    public IssueCategory getIssueCategory() { return issueCategory; }
    public void setIssueCategory(IssueCategory issueCategory) { this.issueCategory = issueCategory; }

    public Staff getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(Staff assignedStaff) { this.assignedStaff = assignedStaff; }

    public com.csms.asset.entity.Asset getAsset() { return asset; }
    public void setAsset(com.csms.asset.entity.Asset asset) { this.asset = asset; }

    public java.time.LocalDateTime getSlaResponseDeadline() { return slaResponseDeadline; }
    public void setSlaResponseDeadline(java.time.LocalDateTime slaResponseDeadline) { this.slaResponseDeadline = slaResponseDeadline; }

    public java.time.LocalDateTime getSlaResolutionDeadline() { return slaResolutionDeadline; }
    public void setSlaResolutionDeadline(java.time.LocalDateTime slaResolutionDeadline) { this.slaResolutionDeadline = slaResolutionDeadline; }

    public java.time.LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(java.time.LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public java.time.LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(java.time.LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public Boolean getSlaBreached() { return slaBreached; }
    public void setSlaBreached(Boolean slaBreached) { this.slaBreached = slaBreached; }
}