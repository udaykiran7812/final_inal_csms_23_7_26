package com.csms.staff.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import com.csms.role.entity.Role;
import com.csms.role.repository.RoleRepository;
import com.csms.staff.dto.request.CreateStaffRequest;
import com.csms.staff.dto.response.StaffResponse;
import com.csms.staff.entity.Staff;
import com.csms.staff.mapper.StaffMapper;
import com.csms.staff.repository.StaffRepository;
import com.csms.staff.service.StaffService;
import com.csms.subdepartment.entity.SubDepartment;
import com.csms.subdepartment.repository.SubDepartmentRepository;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final DepartmentRepository departmentRepository;
    private final SubDepartmentRepository subDepartmentRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StaffMapper staffMapper;

    @Override
    public ApiResponse<StaffResponse> create(CreateStaffRequest request) {
        if (staffRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Staff email already exists");
        }

        User currentUser = getCurrentUser();
        Long targetDeptId = request.getDepartmentId();

        // Enforce department scope if logged in as DEPARTMENT_ADMIN
        if (currentUser != null && "DEPARTMENT_ADMIN".equalsIgnoreCase(currentUser.getRole().getName())) {
            if (currentUser.getDepartment() != null) {
                targetDeptId = currentUser.getDepartment().getId();
            }
        }

        Department department = departmentRepository.findById(targetDeptId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        // Auto-provision User login account for staff member if not exists
        User staffUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (staffUser == null) {
            Role staffRole = null;
            if (request.getRoleId() != null) {
                staffRole = roleRepository.findById(request.getRoleId()).orElse(null);
            }
            if (staffRole == null) {
                staffRole = roleRepository.findByName("STAFF")
                        .orElseGet(() -> roleRepository.findById(4L)
                        .orElseThrow(() -> new EntityNotFoundException("STAFF role not found")));
            }

            String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                    ? request.getPassword().trim()
                    : "staff123";

            String fullName = request.getName().trim();
            String[] parts = fullName.split("\\s+", 2);
            String fName = parts[0];
            String lName = parts.length > 1 ? parts[1] : "";

            staffUser = new User();
            staffUser.setFirstName(fName);
            staffUser.setLastName(lName);
            staffUser.setEmail(request.getEmail().trim());
            staffUser.setPhone(request.getPhone());
            staffUser.setPassword(passwordEncoder.encode(rawPassword));
            staffUser.setRole(staffRole);
            staffUser.setDepartment(department);
            staffUser.setActive(true);

            staffUser = userRepository.save(staffUser);
        }

        Staff staff = staffMapper.toEntity(request);
        staff.setDepartment(department);
        staff.setUser(staffUser);

        // Multi-Department mapping
        if (request.getDepartmentIds() != null && !request.getDepartmentIds().isEmpty()) {
            java.util.Set<Department> depts = new java.util.HashSet<>(departmentRepository.findAllById(request.getDepartmentIds()));
            staff.setDepartments(depts);
        } else {
            staff.setDepartments(java.util.Set.of(department));
        }

        // Sub-Department mapping
        if (request.getSubDepartmentIds() != null && !request.getSubDepartmentIds().isEmpty()) {
            java.util.Set<SubDepartment> subDepts = new java.util.HashSet<>(subDepartmentRepository.findAllById(request.getSubDepartmentIds()));
            staff.setSubDepartments(subDepts);
            if (!subDepts.isEmpty()) {
                staff.setSubDepartment(subDepts.iterator().next());
            }
        } else if (request.getSubDepartmentId() != null) {
            SubDepartment subDept = subDepartmentRepository.findById(request.getSubDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("SubDepartment not found"));
            staff.setSubDepartment(subDept);
            staff.setSubDepartments(java.util.Set.of(subDept));
        }

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            java.util.Set<Role> roles = new java.util.HashSet<>(roleRepository.findAllById(request.getRoleIds()));
            staff.setRoles(roles);
            if (!roles.isEmpty()) {
                staff.setRole(roles.iterator().next());
            }
        } else if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new EntityNotFoundException("Role not found"));
            staff.setRole(role);
            staff.setRoles(java.util.Set.of(role));
        }

        staff = staffRepository.save(staff);
        return ApiResponse.success("Staff created & user login account provisioned successfully", staffMapper.toResponse(staff));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<StaffResponse>> getAll() {
        User currentUser = getCurrentUser();
        List<Staff> staffEntities;

        if (currentUser != null && "DEPARTMENT_ADMIN".equalsIgnoreCase(currentUser.getRole().getName())) {
            if (currentUser.getDepartment() != null) {
                Long deptId = currentUser.getDepartment().getId();
                staffEntities = staffRepository.findDistinctByDepartmentIdOrDepartments_IdAndActiveTrue(deptId, deptId);
            } else {
                staffEntities = List.of();
            }
        } else {
            staffEntities = staffRepository.findByActiveTrue();
        }

        List<StaffResponse> staffList = staffEntities.stream()
                .map(staffMapper::toResponse)
                .toList();

        return ApiResponse.success("Staff fetched successfully", staffList);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<StaffResponse> getById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found"));

        return ApiResponse.success("Staff fetched successfully", staffMapper.toResponse(staff));
    }

    @Override
    public ApiResponse<StaffResponse> update(Long id, CreateStaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found"));

        User currentUser = getCurrentUser();
        Long targetDeptId = request.getDepartmentId();

        if (currentUser != null && "DEPARTMENT_ADMIN".equalsIgnoreCase(currentUser.getRole().getName())) {
            if (currentUser.getDepartment() != null) {
                targetDeptId = currentUser.getDepartment().getId();
            }
        }

        Department department = departmentRepository.findById(targetDeptId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        staff.setName(request.getName());
        staff.setEmail(request.getEmail());
        staff.setPhone(request.getPhone());
        staff.setDepartment(department);

        // Multi-Department update
        if (request.getDepartmentIds() != null && !request.getDepartmentIds().isEmpty()) {
            java.util.Set<Department> depts = new java.util.HashSet<>(departmentRepository.findAllById(request.getDepartmentIds()));
            staff.setDepartments(depts);
        } else {
            staff.getDepartments().clear();
            staff.getDepartments().add(department);
        }

        // Multi Sub-Department update
        if (request.getSubDepartmentIds() != null && !request.getSubDepartmentIds().isEmpty()) {
            java.util.Set<SubDepartment> subDepts = new java.util.HashSet<>(subDepartmentRepository.findAllById(request.getSubDepartmentIds()));
            staff.setSubDepartments(subDepts);
            if (!subDepts.isEmpty()) {
                staff.setSubDepartment(subDepts.iterator().next());
            }
        } else if (request.getSubDepartmentId() != null) {
            SubDepartment subDept = subDepartmentRepository.findById(request.getSubDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("SubDepartment not found"));
            staff.setSubDepartment(subDept);
            staff.setSubDepartments(java.util.Set.of(subDept));
        } else {
            staff.setSubDepartment(null);
            staff.getSubDepartments().clear();
        }

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            java.util.Set<Role> roles = new java.util.HashSet<>(roleRepository.findAllById(request.getRoleIds()));
            staff.setRoles(roles);
            if (!roles.isEmpty()) {
                staff.setRole(roles.iterator().next());
            }
        } else if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new EntityNotFoundException("Role not found"));
            staff.setRole(role);
            staff.setRoles(java.util.Set.of(role));
        } else {
            staff.setRole(null);
            staff.getRoles().clear();
        }

        // Sync linked user details
        if (staff.getUser() != null) {
            String fullName = request.getName().trim();
            String[] parts = fullName.split("\\s+", 2);
            staff.getUser().setFirstName(parts[0]);
            staff.getUser().setLastName(parts.length > 1 ? parts[1] : "");
            staff.getUser().setEmail(request.getEmail().trim());
            staff.getUser().setPhone(request.getPhone());
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                staff.getUser().setPassword(passwordEncoder.encode(request.getPassword().trim()));
            }
            userRepository.save(staff.getUser());
        }

        staff = staffRepository.save(staff);
        return ApiResponse.success("Staff updated successfully", staffMapper.toResponse(staff));
    }

    @Override
    public ApiResponse<String> delete(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found"));

        staff.setActive(false);
        if (staff.getUser() != null) {
            staff.getUser().setActive(false);
            userRepository.save(staff.getUser());
        }
        staffRepository.save(staff);

        return ApiResponse.success("Staff deleted successfully", null);
    }

    private User getCurrentUser() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByEmailWithRole(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}