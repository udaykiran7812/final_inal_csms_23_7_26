package com.csms.role.service.impl;

import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import com.csms.role.dto.request.CreateRoleRequest;
import com.csms.role.dto.response.RoleResponse;
import com.csms.role.entity.Role;
import com.csms.role.exception.RoleAlreadyExistsException;
import com.csms.role.exception.RoleNotFoundException;
import com.csms.role.mapper.RoleMapper;
import com.csms.role.repository.RoleRepository;
import com.csms.role.service.RoleService;
import com.csms.staff.repository.StaffRepository;
import com.csms.subdepartment.entity.SubDepartment;
import com.csms.subdepartment.repository.SubDepartmentRepository;
import com.csms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final SubDepartmentRepository subDepartmentRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        if (request.getDepartmentId() == null) {
            throw new IllegalArgumentException("Department must be selected to create a role.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        if (roleRepository.existsByNameAndDepartmentId(request.getName(), request.getDepartmentId())) {
            throw new RoleAlreadyExistsException("Role '" + request.getName() + "' already exists in department '" + department.getName() + "'");
        }

        Role role = roleMapper.toEntity(request);
        role.setDepartment(department);

        if (request.getSubDepartmentId() != null) {
            SubDepartment subDept = subDepartmentRepository.findById(request.getSubDepartmentId())
                    .orElseThrow(() -> new RuntimeException("SubDepartment not found with ID: " + request.getSubDepartmentId()));
            role.setSubDepartment(subDept);
        }

        role = roleRepository.save(role);
        return roleMapper.toResponse(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getRolesByDepartmentId(Long departmentId) {
        return roleRepository.findByDepartmentId(departmentId)
                .stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getRolesBySubDepartmentId(Long subDepartmentId) {
        return roleRepository.findBySubDepartmentId(subDepartmentId)
                .stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with ID: " + id));
        return roleMapper.toResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, CreateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with ID: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.setDepartment(department);

        if (request.getSubDepartmentId() != null) {
            SubDepartment subDept = subDepartmentRepository.findById(request.getSubDepartmentId())
                    .orElseThrow(() -> new RuntimeException("SubDepartment not found with ID: " + request.getSubDepartmentId()));
            role.setSubDepartment(subDept);
        } else {
            role.setSubDepartment(null);
        }

        role = roleRepository.save(role);
        return roleMapper.toResponse(role);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with ID: " + id));

        long assignedUsersCount = userRepository.findAll().stream().filter(u -> u.getRole() != null && u.getRole().getId().equals(id)).count();
        if (assignedUsersCount > 0) {
            throw new IllegalStateException("Cannot delete role '" + role.getName() + "'. It is assigned to " + assignedUsersCount + " active user(s).");
        }

        roleRepository.delete(role);
    }
}