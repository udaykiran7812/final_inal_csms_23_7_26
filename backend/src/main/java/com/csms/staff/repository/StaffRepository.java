package com.csms.staff.repository;

import com.csms.staff.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByEmail(String email);

    List<Staff> findByActiveTrue();

    List<Staff> findByDepartmentIdAndActiveTrue(Long departmentId);

    List<Staff> findDistinctByDepartmentIdOrDepartments_IdAndActiveTrue(Long departmentId1, Long departmentId2);

    List<Staff> findByDepartmentIdAndSubDepartmentIdAndActiveTrue(Long departmentId, Long subDepartmentId);
}