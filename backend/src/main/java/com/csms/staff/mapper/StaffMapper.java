package com.csms.staff.mapper;

import com.csms.staff.dto.request.CreateStaffRequest;
import com.csms.staff.dto.response.StaffResponse;
import com.csms.staff.entity.Staff;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {

    public Staff toEntity(CreateStaffRequest request) {
        Staff staff = new Staff();
        staff.setName(request.getName());
        staff.setEmail(request.getEmail());
        staff.setPhone(request.getPhone());
        return staff;
    }

    public StaffResponse toResponse(Staff staff) {
        StaffResponse response = new StaffResponse();
        response.setId(staff.getId());
        response.setName(staff.getName());
        response.setEmail(staff.getEmail());
        response.setPhone(staff.getPhone());

        if (staff.getDepartment() != null) {
            response.setDepartmentId(staff.getDepartment().getId());
            response.setDepartmentName(staff.getDepartment().getName());
        }

        if (staff.getSubDepartment() != null) {
            response.setSubDepartmentId(staff.getSubDepartment().getId());
            response.setSubDepartmentName(staff.getSubDepartment().getName());
        }

        java.util.List<Long> rIds = new java.util.ArrayList<>();
        java.util.List<String> rNames = new java.util.ArrayList<>();

        if (staff.getRoles() != null && !staff.getRoles().isEmpty()) {
            staff.getRoles().forEach(r -> {
                rIds.add(r.getId());
                rNames.add(r.getName());
            });
        }
        if (staff.getRole() != null) {
            if (!rIds.contains(staff.getRole().getId())) {
                rIds.add(staff.getRole().getId());
                rNames.add(staff.getRole().getName());
            }
            response.setRoleId(staff.getRole().getId());
            response.setRoleName(staff.getRole().getName());
        } else if (!rNames.isEmpty()) {
            response.setRoleId(rIds.get(0));
            response.setRoleName(rNames.get(0));
        }

        response.setRoleIds(rIds);
        response.setRoleNames(rNames);

        // Map multiple departments
        java.util.List<Long> dIds = new java.util.ArrayList<>();
        java.util.List<String> dNames = new java.util.ArrayList<>();
        if (staff.getDepartments() != null && !staff.getDepartments().isEmpty()) {
            staff.getDepartments().forEach(d -> {
                dIds.add(d.getId());
                dNames.add(d.getName());
            });
        }
        if (staff.getDepartment() != null && !dIds.contains(staff.getDepartment().getId())) {
            dIds.add(0, staff.getDepartment().getId());
            dNames.add(0, staff.getDepartment().getName());
        }
        response.setDepartmentIds(dIds);
        response.setDepartmentNames(dNames);

        // Map multiple sub-departments
        java.util.List<Long> sdIds = new java.util.ArrayList<>();
        java.util.List<String> sdNames = new java.util.ArrayList<>();
        if (staff.getSubDepartments() != null && !staff.getSubDepartments().isEmpty()) {
            staff.getSubDepartments().forEach(sd -> {
                sdIds.add(sd.getId());
                sdNames.add(sd.getName());
            });
        }
        if (staff.getSubDepartment() != null && !sdIds.contains(staff.getSubDepartment().getId())) {
            sdIds.add(0, staff.getSubDepartment().getId());
            sdNames.add(0, staff.getSubDepartment().getName());
        }
        response.setSubDepartmentIds(sdIds);
        response.setSubDepartmentNames(sdNames);

        return response;
    }
}