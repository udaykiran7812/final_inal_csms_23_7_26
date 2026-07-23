package com.csms.sla.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.department.entity.Department;
import com.csms.priority.entity.Priority;
import com.csms.subdepartment.entity.SubDepartment;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sla_rules")
@Getter
@Setter
@NoArgsConstructor
public class SlaRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "priority_id", nullable = false)
    private Priority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_department_id")
    private SubDepartment subDepartment;

    @Column(name = "user_role", length = 50)
    private String userRole; // e.g. "FACULTY", "STUDENT"

    @Column(name = "response_time_limit_minutes", nullable = false)
    private Integer responseTimeLimitMinutes;

    @Column(name = "resolution_time_limit_minutes", nullable = false)
    private Integer resolutionTimeLimitMinutes;
}
