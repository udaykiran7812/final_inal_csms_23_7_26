package com.csms.escalation.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.sla.entity.SlaRule;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "escalation_rules")
@Getter
@Setter
@NoArgsConstructor
public class EscalationRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sla_rule_id", nullable = false)
    private SlaRule slaRule;

    @Column(name = "trigger_after_minutes", nullable = false)
    private Integer triggerAfterMinutes;

    @Column(name = "escalation_level", nullable = false)
    private Integer escalationLevel; // 1, 2, 3

    @Column(name = "notify_role", nullable = false, length = 50)
    private String notifyRole; // e.g. "DEPARTMENT_ADMIN", "ADMIN", "SUPER_ADMIN"
}
