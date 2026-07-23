package com.csms.subdepartment.repository;

import com.csms.subdepartment.entity.SubDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubDepartmentRepository extends JpaRepository<SubDepartment, Long> {

    List<SubDepartment> findByDepartmentIdAndActiveTrue(Long departmentId);

    List<SubDepartment> findByActiveTrue();

    Optional<SubDepartment> findByNameAndDepartmentId(String name, Long departmentId);

    boolean existsByNameAndDepartmentId(String name, Long departmentId);
}
