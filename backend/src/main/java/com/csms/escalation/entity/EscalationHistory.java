package com.csms.escalation.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.ticket.entity.Ticket;
import com.csms.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "escalation_history")
@Getter
@Setter
@NoArgsConstructor
public class EscalationHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(name = "escalation_level", nullable = false)
    private Integer escalationLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notified_user_id", nullable = false)
    private User notifiedUser;

    @Column(name = "triggered_at")
    private java.time.LocalDateTime triggeredAt;
}
