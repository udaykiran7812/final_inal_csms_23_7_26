package com.csms.role.entity;

import com.csms.common.entity.BaseEntity;
import com.csms.department.entity.Department;
import com.csms.subdepartment.entity.SubDepartment;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles", uniqueConstraints = {
    @UniqueConstraint(name = "uq_role_name_dept", columnNames = {"name", "department_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Role extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_department_id")
    private SubDepartment subDepartment;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public SubDepartment getSubDepartment() { return subDepartment; }
    public void setSubDepartment(SubDepartment subDepartment) { this.subDepartment = subDepartment; }

    public Set<Permission> getPermissions() { return permissions; }
    public void setPermissions(Set<Permission> permissions) { this.permissions = permissions; }
}