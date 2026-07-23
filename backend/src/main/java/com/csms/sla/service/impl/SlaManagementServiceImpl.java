package com.csms.sla.service.impl;

import com.csms.common.response.ApiResponse;
import com.csms.department.entity.Department;
import com.csms.department.repository.DepartmentRepository;
import com.csms.priority.entity.Priority;
import com.csms.priority.repository.PriorityRepository;
import com.csms.sla.dto.request.CreateSlaRuleRequest;
import com.csms.sla.dto.response.SlaRuleResponse;
import com.csms.sla.entity.SlaRule;
import com.csms.sla.repository.SlaRuleRepository;
import com.csms.sla.service.SlaManagementService;
import com.csms.subdepartment.entity.SubDepartment;
import com.csms.subdepartment.repository.SubDepartmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SlaManagementServiceImpl implements SlaManagementService {

    private final SlaRuleRepository slaRuleRepository;
    private final DepartmentRepository departmentRepository;
    private final SubDepartmentRepository subDepartmentRepository;
    private final PriorityRepository priorityRepository;

    @Override
    public ApiResponse<SlaRuleResponse> create(CreateSlaRuleRequest request) {
        Priority priority = priorityRepository.findById(request.getPriorityId())
                .orElseThrow(() -> new EntityNotFoundException("Priority not found"));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        }

        SubDepartment subDepartment = null;
        if (request.getSubDepartmentId() != null) {
            subDepartment = subDepartmentRepository.findById(request.getSubDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("SubDepartment not found"));
        }

        SlaRule rule = new SlaRule();
        rule.setPriority(priority);
        rule.setDepartment(department);
        rule.setSubDepartment(subDepartment);
        rule.setUserRole(request.getUserRole() != null ? request.getUserRole() : "ALL");
        rule.setResponseTimeLimitMinutes(request.getResponseTimeLimitMinutes());
        rule.setResolutionTimeLimitMinutes(request.getResolutionTimeLimitMinutes());
        rule.setActive(true);

        rule = slaRuleRepository.save(rule);
        return ApiResponse.success("SLA Rule created successfully", mapToResponse(rule));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<SlaRuleResponse>> getAll() {
        List<SlaRuleResponse> list = slaRuleRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ApiResponse.success("SLA Rules fetched successfully", list);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SlaRuleResponse> getById(Long id) {
        SlaRule rule = slaRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SLA Rule not found"));
        return ApiResponse.success("SLA Rule fetched successfully", mapToResponse(rule));
    }

    @Override
    public ApiResponse<SlaRuleResponse> update(Long id, CreateSlaRuleRequest request) {
        SlaRule rule = slaRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SLA Rule not found"));

        Priority priority = priorityRepository.findById(request.getPriorityId())
                .orElseThrow(() -> new EntityNotFoundException("Priority not found"));

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        }

        SubDepartment subDepartment = null;
        if (request.getSubDepartmentId() != null) {
            subDepartment = subDepartmentRepository.findById(request.getSubDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("SubDepartment not found"));
        }

        rule.setPriority(priority);
        rule.setDepartment(department);
        rule.setSubDepartment(subDepartment);
        if (request.getUserRole() != null) {
            rule.setUserRole(request.getUserRole());
        }
        rule.setResponseTimeLimitMinutes(request.getResponseTimeLimitMinutes());
        rule.setResolutionTimeLimitMinutes(request.getResolutionTimeLimitMinutes());

        rule = slaRuleRepository.save(rule);
        return ApiResponse.success("SLA Rule updated successfully", mapToResponse(rule));
    }

    @Override
    public ApiResponse<String> delete(Long id) {
        SlaRule rule = slaRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SLA Rule not found"));
        rule.setActive(false);
        slaRuleRepository.save(rule);
        return ApiResponse.success("SLA Rule deleted successfully", "Deleted ID: " + id);
    }

    private SlaRuleResponse mapToResponse(SlaRule rule) {
        return new SlaRuleResponse(
                rule.getId(),
                rule.getDepartment() != null ? rule.getDepartment().getId() : null,
                rule.getDepartment() != null ? rule.getDepartment().getName() : "All Departments",
                rule.getSubDepartment() != null ? rule.getSubDepartment().getId() : null,
                rule.getSubDepartment() != null ? rule.getSubDepartment().getName() : "All SubDepartments",
                rule.getPriority().getId(),
                rule.getPriority().getName(),
                rule.getUserRole(),
                rule.getResponseTimeLimitMinutes(),
                rule.getResolutionTimeLimitMinutes(),
                rule.getActive()
        );
    }
}
