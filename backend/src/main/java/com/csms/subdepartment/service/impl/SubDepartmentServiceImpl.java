package com.csms.subdepartment.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import com.csms.subdepartment.dto.request.CreateSubDepartmentRequest;
import com.csms.subdepartment.dto.response.SubDepartmentResponse;
import com.csms.subdepartment.entity.SubDepartment;
import com.csms.subdepartment.repository.SubDepartmentRepository;
import com.csms.subdepartment.service.SubDepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubDepartmentServiceImpl implements SubDepartmentService {

    private final SubDepartmentRepository subDepartmentRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public ApiResponse<SubDepartmentResponse> create(CreateSubDepartmentRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        if (subDepartmentRepository.existsByNameAndDepartmentId(request.getName(), request.getDepartmentId())) {
            throw new RuntimeException("SubDepartment with name '" + request.getName() + "' already exists in department '" + department.getName() + "'");
        }

        SubDepartment subDepartment = new SubDepartment();
        subDepartment.setName(request.getName());
        subDepartment.setDescription(request.getDescription());
        subDepartment.setDepartment(department);
        subDepartment.setActive(true);

        subDepartment = subDepartmentRepository.save(subDepartment);
        return ApiResponse.success("SubDepartment created successfully", mapToResponse(subDepartment));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<SubDepartmentResponse>> getAll() {
        List<SubDepartmentResponse> list = subDepartmentRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
        return ApiResponse.success("SubDepartments fetched successfully", list);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<SubDepartmentResponse>> getByDepartmentId(Long departmentId) {
        List<SubDepartmentResponse> list = subDepartmentRepository.findByDepartmentIdAndActiveTrue(departmentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
        return ApiResponse.success("SubDepartments fetched for department successfully", list);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SubDepartmentResponse> getById(Long id) {
        SubDepartment subDepartment = subDepartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubDepartment not found with ID: " + id));
        return ApiResponse.success("SubDepartment fetched successfully", mapToResponse(subDepartment));
    }

    @Override
    @Transactional
    public ApiResponse<SubDepartmentResponse> update(Long id, CreateSubDepartmentRequest request) {
        SubDepartment subDepartment = subDepartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubDepartment not found with ID: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        subDepartment.setName(request.getName());
        subDepartment.setDescription(request.getDescription());
        subDepartment.setDepartment(department);

        subDepartment = subDepartmentRepository.save(subDepartment);
        return ApiResponse.success("SubDepartment updated successfully", mapToResponse(subDepartment));
    }

    @Override
    @Transactional
    public ApiResponse<String> delete(Long id) {
        SubDepartment subDepartment = subDepartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubDepartment not found with ID: " + id));
        subDepartment.setActive(false);
        subDepartmentRepository.save(subDepartment);
        return ApiResponse.success("SubDepartment deleted successfully", "Deleted ID: " + id);
    }

    private SubDepartmentResponse mapToResponse(SubDepartment subDept) {
        return new SubDepartmentResponse(
                subDept.getId(),
                subDept.getName(),
                subDept.getDescription(),
                subDept.getDepartment().getId(),
                subDept.getDepartment().getName(),
                subDept.getActive()
        );
    }
}
