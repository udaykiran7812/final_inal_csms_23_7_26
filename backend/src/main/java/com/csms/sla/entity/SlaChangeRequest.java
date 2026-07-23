package com.csms.sla.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sla_change_requests")
@Getter
@Setter
@NoArgsConstructor
public class SlaChangeRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Column(nullable = false)
    private String priorityName;

    @Column(nullable = false)
    private String userRole;

    @Column(nullable = false)
    private Integer proposedResponseTimeLimitMinutes;

    @Column(nullable = false)
    private Integer proposedResolutionTimeLimitMinutes;

    @Column(columnDefinition = "TEXT")
    private String justification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }
}
