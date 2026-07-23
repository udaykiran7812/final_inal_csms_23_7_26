package com.csms.sla.repository;

import com.csms.sla.entity.SlaRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlaRuleRepository extends JpaRepository<SlaRule, Long> {

    Optional<SlaRule> findByPriorityNameAndUserRoleAndActiveTrue(String priorityName, String userRole);

    Optional<SlaRule> findByDepartmentIdAndSubDepartmentIdAndPriorityNameAndActiveTrue(Long departmentId, Long subDepartmentId, String priorityName);

    Optional<SlaRule> findByDepartmentIdAndPriorityNameAndActiveTrue(Long departmentId, String priorityName);

    Optional<SlaRule> findByDepartmentIdAndSubDepartmentIdAndPriorityIdAndActiveTrue(Long departmentId, Long subDepartmentId, Long priorityId);

    List<SlaRule> findByDepartmentIdAndActiveTrue(Long departmentId);

    List<SlaRule> findByActiveTrue();
}
