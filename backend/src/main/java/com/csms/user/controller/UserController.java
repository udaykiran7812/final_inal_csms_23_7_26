package com.csms.user.controller;

import com.csms.common.response.ApiResponse;
import com.csms.user.dto.request.CreateUserRequest;
import com.csms.user.dto.response.UserResponse;
import com.csms.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        return ApiResponse.success(
                "User created successfully",
                userService.createUser(request)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<List<UserResponse>> getAllUsers() {

        return ApiResponse.success(
                "Users fetched successfully",
                userService.getAllUsers()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<UserResponse> getUserById(
            @PathVariable Long id) {

        return ApiResponse.success(
                "User fetched successfully",
                userService.getUserById(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody CreateUserRequest request) {

        return ApiResponse.success(
                "User updated successfully",
                userService.updateUser(id, request)
        );
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<String> resetPassword(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> payload) {

        String newPassword = (payload != null && payload.containsKey("password")) ? payload.get("password") : "admin123";
        userService.resetPassword(id, newPassword);
        return ApiResponse.success("Password reset successfully", "New password set");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);
        return ApiResponse.success("User deactivated successfully", null);
    }
}