package com.csms.department.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.department.dto.request.CreateDepartmentRequest;
import com.csms.department.dto.response.DepartmentResponse;
import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import com.csms.department.service.DepartmentService;
import com.csms.role.entity.Role;
import com.csms.role.repository.RoleRepository;
import com.csms.user.entity.User;
import com.csms.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse<DepartmentResponse> create(CreateDepartmentRequest request) {
        if (departmentRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Department with name '" + request.getName() + "' already exists.");
        }

        Department department = new Department();
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department = departmentRepository.save(department);

        // Provision Department Admin if credentials provided
        processDepartmentAdmin(department, request);

        return ApiResponse.success("Department created successfully", toResponseDto(department));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DepartmentResponse>> getAll() {
        List<DepartmentResponse> departments = departmentRepository.findByActiveTrue()
                .stream()
                .map(this::toResponseDto)
                .toList();

        return ApiResponse.success("Departments fetched successfully", departments);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DepartmentResponse> getById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        return ApiResponse.success("Department fetched successfully", toResponseDto(department));
    }

    @Override
    public ApiResponse<DepartmentResponse> update(Long id, CreateDepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department = departmentRepository.save(department);

        // Provision or update Department Admin credentials
        processDepartmentAdmin(department, request);

        return ApiResponse.success("Department updated successfully", toResponseDto(department));
    }

    @Override
    public ApiResponse<String> delete(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        department.setActive(false);
        departmentRepository.save(department);

        return ApiResponse.success("Department deleted successfully", null);
    }

    private void processDepartmentAdmin(Department department, CreateDepartmentRequest request) {
        if (request.getAdminEmail() != null && !request.getAdminEmail().isBlank()) {
            String email = request.getAdminEmail().trim();

            Role deptAdminRole = roleRepository.findByName("DEPARTMENT_ADMIN")
                    .orElseGet(() -> roleRepository.findById(3L)
                    .orElseThrow(() -> new EntityNotFoundException("DEPARTMENT_ADMIN role not found")));

            User adminUser = userRepository.findByEmail(email).orElse(null);

            if (adminUser == null) {
                adminUser = new User();
                adminUser.setFirstName(request.getAdminFirstName() != null && !request.getAdminFirstName().isBlank()
                        ? request.getAdminFirstName().trim() : department.getName());
                adminUser.setLastName(request.getAdminLastName() != null && !request.getAdminLastName().isBlank()
                        ? request.getAdminLastName().trim() : "Dept Admin");
                adminUser.setEmail(email);
                adminUser.setActive(true);
            } else {
                if (request.getAdminFirstName() != null && !request.getAdminFirstName().isBlank()) {
                    adminUser.setFirstName(request.getAdminFirstName().trim());
                }
                if (request.getAdminLastName() != null && !request.getAdminLastName().isBlank()) {
                    adminUser.setLastName(request.getAdminLastName().trim());
                }
            }

            if (request.getAdminPassword() != null && !request.getAdminPassword().isBlank()) {
                adminUser.setPassword(passwordEncoder.encode(request.getAdminPassword().trim()));
            } else if (adminUser.getPassword() == null) {
                adminUser.setPassword(passwordEncoder.encode("admin123"));
            }

            adminUser.setRole(deptAdminRole);
            adminUser.setDepartment(department);
            userRepository.save(adminUser);
        }
    }

    private DepartmentResponse toResponseDto(Department dept) {
        DepartmentResponse dto = new DepartmentResponse();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setDescription(dept.getDescription());
        dto.setActive(dept.getActive());

        List<User> deptAdmins = userRepository.findByRole_NameAndDepartmentIdAndActiveTrue("DEPARTMENT_ADMIN", dept.getId());
        if (!deptAdmins.isEmpty()) {
            User admin = deptAdmins.get(0);
            dto.setAdminEmail(admin.getEmail());
            dto.setAdminName(admin.getFirstName() + " " + (admin.getLastName() != null ? admin.getLastName() : ""));
        }

        return dto;
    }
}