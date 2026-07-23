package com.csms.escalation.repository;

import com.csms.escalation.entity.EscalationRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EscalationRuleRepository extends JpaRepository<EscalationRule, Long> {

    List<EscalationRule> findBySlaRuleIdAndActiveTrueOrderByEscalationLevelAsc(Long slaRuleId);

    List<EscalationRule> findByActiveTrueOrderBySlaRuleIdAscEscalationLevelAsc();
}
