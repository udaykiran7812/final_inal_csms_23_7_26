package com.csms.subdepartment.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.department.entity.Department;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sub_departments", uniqueConstraints = {
    @UniqueConstraint(name = "uq_sub_dept_name_dept", columnNames = {"name", "department_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class SubDepartment extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
