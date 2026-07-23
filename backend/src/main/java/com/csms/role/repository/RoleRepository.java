package com.csms.role.repository;

import com.csms.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

    boolean existsByNameAndDepartmentId(String name, Long departmentId);

    List<Role> findByDepartmentId(Long departmentId);

    List<Role> findBySubDepartmentId(Long subDepartmentId);
}